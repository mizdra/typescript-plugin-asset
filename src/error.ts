export class AppParseArgvValidationError extends Error {
  static {
    this.prototype.name = 'AppParseArgvValidationError';
  }
}

export function handleAppError(err: unknown) {
  if (err instanceof AppParseArgvValidationError) {
    // eslint-disable-next-line no-console
    console.error(err.message);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
  throw err;
}
