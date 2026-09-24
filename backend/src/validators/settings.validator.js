/**
 * ─────────────────────────────────────────────
 *  Validator — School Settings
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

const addressSchema = Joi.object({
  street:  Joi.string().max(200).trim().allow('').default(''),
  city:    Joi.string().max(100).trim().allow('').default(''),
  state:   Joi.string().max(100).trim().allow('').default(''),
  zip:     Joi.string().max(20).trim().allow('').default(''),
  country: Joi.string().max(100).trim().allow('').default(''),
}).default({});

export const updateSettingsSchema = Joi.object({
  schoolName:          Joi.string().min(1).max(200).trim(),
  schoolCode:          Joi.string().max(50).trim().allow(''),
  tagline:             Joi.string().max(300).trim().allow(''),
  logoUrl:             Joi.string().trim().allow(''),
  email:               Joi.string().email().trim().allow(''),
  phone:               Joi.string().pattern(/^\+?[\d\s\-().]{7,20}$/).allow('').messages({
                         'string.pattern.base': 'Please provide a valid phone number',
                       }),
  website:             Joi.string().trim().allow(''),
  address:             addressSchema,
  currentAcademicYear: Joi.string().pattern(/^\d{4}-\d{4}$/).allow('').messages({
                         'string.pattern.base': 'Academic year must be in format YYYY-YYYY',
                       }),
  currency:            Joi.string().max(10).trim().allow(''),
  timezone:            Joi.string().max(100).trim().allow(''),
}).min(1).messages({ 'object.min': 'At least one field must be provided' });
