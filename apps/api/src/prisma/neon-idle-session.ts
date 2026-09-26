export const NEON_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export type NeonConnectionPhase = 'down' | 'active' | 'idle' | 'disconnected';

export class NeonIdleSession {
  private phaseValue: NeonConnectionPhase = 'down';
  private pending = 0;
  private epoch = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly idleMs: number,
    private readonly onInactive: () => void,
  ) {}

  get phase(): NeonConnectionPhase {
    return this.phaseValue;
  }

  markConnected(): void {
    this.phaseValue = 'active';
    this.arm();
  }

  acquire(): boolean {
    this.pending += 1;
    this.invalidate();
    const resumed = this.phaseValue !== 'active';
    this.phaseValue = 'active';
    return resumed;
  }

  release(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending === 0 && this.phaseValue === 'active') {
      this.arm();
    }
  }

  markDisconnected(): void {
    this.phaseValue = 'disconnected';
    this.invalidate();
  }

  stop(): void {
    this.phaseValue = 'down';
    this.invalidate();
  }

  private arm(): void {
    this.clearTimer();
    const epoch = this.epoch;
    this.timer = setTimeout(() => {
      if (epoch !== this.epoch || this.pending > 0 || this.phaseValue !== 'active') {
        return;
      }
      this.phaseValue = 'idle';
      this.onInactive();
    }, this.idleMs);
    this.timer.unref?.();
  }

  private invalidate(): void {
    this.epoch += 1;
    this.clearTimer();
  }

  private clearTimer(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}
