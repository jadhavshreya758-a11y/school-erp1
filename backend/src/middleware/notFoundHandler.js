/**
 * ─────────────────────────────────────────────
 *  404 Not-Found Middleware
 * ─────────────────────────────────────────────
 *  Handles any request that did not match a route.
 */

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
