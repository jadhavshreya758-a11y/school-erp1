/**
 * ─────────────────────────────────────────────
 *  Validator — Class
 * ─────────────────────────────────────────────
 */

import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// ── Middleware factory ─────────────────────────
export const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return next(new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, errors.join('; ')));
  }
  req.body = value;
  next();
};

// ── Schemas ───────────────────────────────────
const academicYear = Joi.string()
  .pattern(/^\d{4}-\d{4}$/)
  .required()
  .messages({
    'string.pattern.base': 'Academic year must be in format YYYY-YYYY (e.g. 2024-2025)',
    'any.required': 'Academic year is required',
  });

export const createClassSchema = Joi.object({
  name:         Joi.string().min(1).max(100).trim().required().messages({ 'any.required': 'Class name is required' }),
  section:      Joi.string().max(20).trim().allow('').default(''),
  academicYear,
  capacity:     Joi.number().integer().min(1).max(200).default(40),
  description:  Joi.string().max(500).trim().allow('').default(''),
});

export const updateClassSchema = Joi.object({
  name:         Joi.string().min(1).max(100).trim(),
  section:      Joi.string().max(20).trim().allow(''),
  academicYear,
  capacity:     Joi.number().integer().min(1).max(200),
  description:  Joi.string().max(500).trim().allow(''),
  isActive:     Joi.boolean(),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });
