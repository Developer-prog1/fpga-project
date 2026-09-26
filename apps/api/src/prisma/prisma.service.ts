import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { isNeonConnectionError, neonErrorText } from './neon-connection-error.js';
import { NEON_IDLE_TIMEOUT_MS, NeonIdleSession } from './neon-idle-session.js';

const INACTIVE_MESSAGE =
  'Neon database inactive — connection released after 5 minutes without activity';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'error' | 'warn'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Neon');
  private readonly session = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, () => {
    void this.enterIdle();
  });
  private closing = false;
  private releasing = false;
  private faultAt = 0;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
    this.listenForEngineFaults();
  }

  static create(): PrismaService {
    return new PrismaService().withIdleGuard();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      this.reportDisconnect(neonErrorText(error));
      throw error;
    }
    this.session.markConnected();
    this.logger.log('Neon database connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.closing = true;
    this.session.stop();
    await this.$disconnect();
  }

  private withIdleGuard(): PrismaService {
    const guarded = this.$extends({
      name: 'neon-idle',
      query: {
        $allOperations: ({ args, query }) => this.observe(query, args),
      },
    });

    return new Proxy(guarded, {
      get: (target, prop) => this.readGuarded(target, prop),
      has: (target, prop) => this.hasGuarded(target, prop),
    }) as unknown as PrismaService;
  }

  private readGuarded(target: object, prop: PropertyKey): unknown {
    if (prop === 'onModuleInit') return () => this.onModuleInit();
    if (prop === 'onModuleDestroy') return () => this.onModuleDestroy();
    const value: unknown = Reflect.get(target, prop);
    if (typeof value !== 'function') return value;
    return value.bind(target);
  }

  private hasGuarded(target: object, prop: PropertyKey): boolean {
    return prop === 'onModuleInit' || prop === 'onModuleDestroy' || Reflect.has(target, prop);
  }

  private async observe<A, T>(query: (args: A) => Promise<T>, args: A): Promise<T> {
    const resumed = this.session.acquire();
    try {
      const result = await query(args);
      if (resumed) this.logger.log('Neon database connection is active');
      return result;
    } catch (error) {
      if (isNeonConnectionError(error)) this.reportDisconnect(neonErrorText(error));
      throw error;
    } finally {
      this.session.release();
    }
  }

  private async enterIdle(): Promise<void> {
    if (this.closing || phaseOf(this.session) !== 'idle') return;
    this.releasing = true;
    try {
      await this.$disconnect();
      await this.restoreIfBusy();
    } catch (error) {
      this.releasing = false;
      this.reportDisconnect(neonErrorText(error));
    } finally {
      this.releasing = false;
    }
  }

  private async restoreIfBusy(): Promise<void> {
    const phase = phaseOf(this.session);
    if (phase === 'active') {
      await this.$connect();
      return;
    }
    if (phase === 'idle') this.logInactive();
  }

  private logInactive(): void {
    if (this.closing || this.session.phase !== 'idle') return;
    this.logger.error(INACTIVE_MESSAGE);
  }

  private reportDisconnect(message: string): void {
    if (this.closing || this.releasing) return;
    const now = Date.now();
    if (this.session.phase === 'disconnected' && now - this.faultAt < 1_000) return;
    this.faultAt = now;
    this.session.markDisconnected();
    this.logger.error(`Neon database disconnected — ${message}`);
    void this.$disconnect().catch(() => undefined);
  }

  private listenForEngineFaults(): void {
    this.$on('error', (event) => {
      this.reportDisconnect(event.message);
    });
    this.$on('warn', (event) => {
      if (isNeonConnectionError(new Error(event.message))) {
        this.reportDisconnect(event.message);
        return;
      }
      this.logger.warn(event.message);
    });
  }
}

function phaseOf(session: NeonIdleSession) {
  return session.phase;
}
