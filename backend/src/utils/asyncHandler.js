/**
 * ─────────────────────────────────────────────
 *  Utility — Async Handler Wrapper
 * ─────────────────────────────────────────────
 *  Wraps async route handlers so rejected promises
 *  are automatically forwarded to next().
 *
 *  Usage:
 *    router.get('/students', asyncHandler(getStudents));
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
