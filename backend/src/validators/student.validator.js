/**
 * ─────────────────────────────────────────────
 *  Validator — Student
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
const objectId = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .messages({ 'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId' });

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
export const createStudentSchema = Joi.object({
  studentId:     Joi.string().uppercase().pattern(/^[A-Z0-9\-]+$/).required()
                   .messages({ 'any.required': 'Student ID is required', 'string.pattern.base': 'Student ID may only contain letters, numbers and hyphens' }),
  firstName:     Joi.string().min(1).max(50).trim().required().messages({ 'any.required': 'First name is required' }),
  lastName:      Joi.string().min(1).max(50).trim().required().messages({ 'any.required': 'Last name is required' }),
  email:         Joi.string().email().lowercase().trim().allow('').default(''),
  phone:         phone.allow('').default(''),
  dateOfBirth:   Joi.date().iso().less('now').required().messages({ 'any.required': 'Date of birth is required', 'date.less': 'Date of birth must be in the past' }),
  gender:        Joi.string().valid('male', 'female', 'other').required().messages({ 'any.required': 'Gender is required' }),
  admissionDate: Joi.date().iso().default(() => new Date()),
  classId:       objectId.required().messages({ 'any.required': 'Class is required' }),
  parentId:      objectId.required().messages({ 'any.required': 'Parent is required' }),
  address:       addressSchema,
  bloodGroup:    Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '').default(''),
  status:        Joi.string().valid('active', 'inactive', 'transferred', 'graduated').default('active'),
  notes:         Joi.string().max(1000).trim().allow('').default(''),
});

export const updateStudentSchema = Joi.object({
  firstName:     Joi.string().min(1).max(50).trim(),
  lastName:      Joi.string().min(1).max(50).trim(),
  email:         Joi.string().email().lowercase().trim().allow(''),
  phone:         phone.allow(''),
  dateOfBirth:   Joi.date().iso().less('now'),
  gender:        Joi.string().valid('male', 'female', 'other'),
  admissionDate: Joi.date().iso(),
  classId:       objectId,
  parentId:      objectId,
  address:       addressSchema,
  bloodGroup:    Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''),
  status:        Joi.string().valid('active', 'inactive', 'transferred', 'graduated'),
  notes:         Joi.string().max(1000).trim().allow(''),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

export const bulkFetchSchema = Joi.object({
  ids: Joi.array().items(objectId).min(1).max(100).required()
        .messages({ 'any.required': 'ids array is required', 'array.min': 'At least one ID required', 'array.max': 'Maximum 100 IDs per request' }),
});
