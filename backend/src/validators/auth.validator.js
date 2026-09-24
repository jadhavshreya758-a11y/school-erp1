/**
 * ─────────────────────────────────────────────
 *  Validator — Auth
 * ─────────────────────────────────────────────
 *  Joi schemas for authentication endpoints.
 *  Middleware factory: validate(schema) returns
 *  an Express middleware that aborts with 422
 *  on validation failure.
 */

import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// ── Reusable schema snippets ──────────────────
const email    = Joi.string().email().lowercase().trim().required().messages({
  'string.email': 'A valid email address is required',
  'any.required': 'Email is required',
});
const password = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters',
  'any.required': 'Password is required',
});

// ── Schemas ───────────────────────────────────
export const loginSchema = Joi.object({
  email,
  password,
});

// ── Middleware factory ─────────────────────────
export const validate = (schema) => (req, _res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, errors.join('; ')));
  }
  next();
};
