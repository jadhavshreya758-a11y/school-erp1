/**
 * ─────────────────────────────────────────────
 *  Global Error-Handling Middleware
 * ─────────────────────────────────────────────
 *  Catches all errors thrown or passed via next()
 *  and returns a consistent JSON error response.
 */

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log full stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('─── Error ──────────────────────');
    console.error(err.stack || err);
    console.error('────────────────────────────────');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
