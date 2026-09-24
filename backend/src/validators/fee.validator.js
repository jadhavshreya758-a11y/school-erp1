/**
 * ─────────────────────────────────────────────
 *  Validator — Fee Structure
 * ─────────────────────────────────────────────
 */

import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

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

const objectId = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .messages({ 'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId' });

const academicYear = Joi.string()
  .pattern(/^\d{4}-\d{4}$/)
  .messages({ 'string.pattern.base': 'Academic year must be in format YYYY-YYYY (e.g. 2024-2025)' });

const breakdownSchema = Joi.object({
  tuition:       Joi.number().min(0).default(0),
  transport:     Joi.number().min(0).default(0),
  library:       Joi.number().min(0).default(0),
  laboratory:    Joi.number().min(0).default(0),
  sports:        Joi.number().min(0).default(0),
  miscellaneous: Joi.number().min(0).default(0),
}).default({});

// ── Schemas ───────────────────────────────────
export const createFeeSchema = Joi.object({
  classId:      objectId.required().messages({ 'any.required': 'Class is required' }),
  academicYear: academicYear.required().messages({ 'any.required': 'Academic year is required' }),
  totalAmount:  Joi.number().min(0).required().messages({ 'any.required': 'Total amount is required', 'number.min': 'Fee amount cannot be negative' }),
  breakdown:    breakdownSchema,
  dueDate:      Joi.date().iso().allow(null).default(null),
  description:  Joi.string().max(500).trim().allow('').default(''),
  isActive:     Joi.boolean().default(true),
});

export const updateFeeSchema = Joi.object({
  totalAmount:  Joi.number().min(0),
  breakdown:    breakdownSchema,
  dueDate:      Joi.date().iso().allow(null),
  description:  Joi.string().max(500).trim().allow(''),
  isActive:     Joi.boolean(),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });
