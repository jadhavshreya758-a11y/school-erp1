/**
 * ─────────────────────────────────────────────
 *  Validator — Parent
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

// ── Reusable snippets ─────────────────────────
const phone = Joi.string()
  .pattern(/^\+?[\d\s\-().]{7,20}$/)
  .messages({ 'string.pattern.base': 'Please provide a valid phone number' });

const addressSchema = Joi.object({
  street: Joi.string().max(200).trim().allow('').default(''),
  city:   Joi.string().max(100).trim().allow('').default(''),
  state:  Joi.string().max(100).trim().allow('').default(''),
  zip:    Joi.string().max(20).trim().allow('').default(''),
}).default({});

// ── Schemas ───────────────────────────────────
export const createParentSchema = Joi.object({
  name:           Joi.string().min(2).max(100).trim().required().messages({ 'any.required': 'Parent name is required' }),
  email:          Joi.string().email().lowercase().trim().required().messages({ 'any.required': 'Email is required' }),
  phone:          phone.required().messages({ 'any.required': 'Phone number is required' }),
  alternatePhone: phone.allow('').default(''),
  address:        addressSchema,
  occupation:     Joi.string().max(100).trim().allow('').default(''),
  relation:       Joi.string().valid('father', 'mother', 'guardian', 'other').default('guardian'),
});

export const updateParentSchema = Joi.object({
  name:           Joi.string().min(2).max(100).trim(),
  email:          Joi.string().email().lowercase().trim(),
  phone:          phone,
  alternatePhone: phone.allow(''),
  address:        addressSchema,
  occupation:     Joi.string().max(100).trim().allow(''),
  relation:       Joi.string().valid('father', 'mother', 'guardian', 'other'),
  isActive:       Joi.boolean(),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });
