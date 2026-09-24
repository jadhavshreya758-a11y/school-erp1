/**
 * ─────────────────────────────────────────────
 *  JWT Authentication Middleware (stub)
 * ─────────────────────────────────────────────
 *  Verifies the Bearer token from the Authorization
 *  header and attaches `req.user`. Implement the
 *  body when you build the auth flow.
 */

import jwt from 'jsonwebtoken';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authentication required. No token provided.');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const err = new Error('Invalid or expired token.');
    err.statusCode = 401;
    next(err);
  }
};

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('admin', 'teacher')
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('You do not have permission to perform this action.');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};
