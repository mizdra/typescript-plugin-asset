export class AppOptionValidationError extends Error {
  // eslint-disable-next-line n/no-unsupported-features/es-syntax -- TODO: Drop Node.js 16
  static {
    this.prototype.name = 'AppOptionValidationError';
  }
}
