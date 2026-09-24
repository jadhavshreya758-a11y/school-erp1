/**
 * ─────────────────────────────────────────────
 *  Utility — Custom API Error
 * ─────────────────────────────────────────────
 *  Throw this instead of generic Error so the
 *  error-handler middleware can extract the
 *  correct HTTP status code.
 *
 *  Usage:
 *    throw new ApiError(404, 'Student not found');
 */

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}
