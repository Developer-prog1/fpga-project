import { describe, expect, it, vi } from 'vitest';
import { isNeonConnectionError } from './neon-connection-error.js';
import { NEON_IDLE_TIMEOUT_MS, NeonIdleSession } from './neon-idle-session.js';

describe('NeonIdleSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('releases the connection after five minutes without activity', () => {
    const onInactive = vi.fn();
    const session = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, onInactive);

    session.markConnected();
    vi.advanceTimersByTime(NEON_IDLE_TIMEOUT_MS - 1);
    expect(onInactive).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onInactive).toHaveBeenCalledOnce();
    expect(session.phase).toBe('idle');
  });

  it('restarts the idle window after a query', () => {
    const onInactive = vi.fn();
    const session = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, onInactive);

    session.markConnected();
    vi.advanceTimersByTime(4 * 60 * 1000);
    session.acquire();
    session.release();
    vi.advanceTimersByTime(4 * 60 * 1000);
    expect(onInactive).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 1000);
    expect(onInactive).toHaveBeenCalledOnce();
  });

  it('waits until in-flight work finishes before the idle window', () => {
    const onInactive = vi.fn();
    const session = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, onInactive);

    session.markConnected();
    session.acquire();
    vi.advanceTimersByTime(NEON_IDLE_TIMEOUT_MS * 2);
    expect(onInactive).not.toHaveBeenCalled();

    session.release();
    vi.advanceTimersByTime(NEON_IDLE_TIMEOUT_MS);
    expect(onInactive).toHaveBeenCalledOnce();
  });

  it('does not go idle after a disconnect or shutdown', () => {
    const onInactive = vi.fn();
    const disconnected = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, onInactive);
    disconnected.markConnected();
    disconnected.markDisconnected();
    vi.advanceTimersByTime(NEON_IDLE_TIMEOUT_MS);
    expect(disconnected.phase).toBe('disconnected');

    const stopped = new NeonIdleSession(NEON_IDLE_TIMEOUT_MS, onInactive);
    stopped.markConnected();
    stopped.stop();
    vi.advanceTimersByTime(NEON_IDLE_TIMEOUT_MS);
    expect(onInactive).not.toHaveBeenCalled();
    expect(stopped.phase).toBe('down');
  });
});

describe('isNeonConnectionError', () => {
  it('recognizes Prisma and driver disconnects', () => {
    expect(isNeonConnectionError({ code: 'P1017', message: 'closed' })).toBe(true);
    expect(isNeonConnectionError(new Error("Can't reach database server at ep-1"))).toBe(
      true,
    );
    expect(isNeonConnectionError(new Error('Unique constraint failed'))).toBe(false);
  });
});
