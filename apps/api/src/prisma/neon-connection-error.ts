const DISCONNECT_CODES = new Set(['P1001', 'P1002', 'P1017']);

const DISCONNECT_SNIPPETS = [
  "can't reach database server",
  'server has closed the connection',
  'terminating connection',
  'connection terminated',
  'connection closed',
  'econnreset',
  'econnrefused',
  'socket hang up',
  'admin shutdown',
] as const;

export function isNeonConnectionError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if (hasDisconnectCode(error)) return true;
  const message = readMessage(error).toLowerCase();
  if (!message) return false;
  return DISCONNECT_SNIPPETS.some((snippet) => message.includes(snippet));
}

export function neonErrorText(error: unknown): string {
  const message = readMessage(error).trim();
  return message || 'connection lost';
}

function hasDisconnectCode(error: object): boolean {
  if (!('code' in error)) return false;
  return DISCONNECT_CODES.has(String(error.code));
}

function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return typeof error.message === 'string' ? error.message : '';
  }
  return '';
}
