/**
 * ─────────────────────────────────────────────
 *  Validator — Attendance
 * ─────────────────────────────────────────────
 */

import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ATTENDANCE_STATUS } from '../constants/index.js';

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

const statusEnum = Object.values(ATTENDANCE_STATUS);

// ── Single attendance record ──────────────────
export const createAttendanceSchema = Joi.object({
  studentId: objectId.required().messages({ 'any.required': 'Student is required' }),
  classId:   objectId.required().messages({ 'any.required': 'Class is required' }),
  date:      Joi.date().iso().required().messages({ 'any.required': 'Date is required' }),
  status:    Joi.string().valid(...statusEnum).required().messages({
               'any.required': 'Status is required',
               'any.only': `Status must be one of: ${statusEnum.join(', ')}`,
             }),
  remarks:   Joi.string().max(500).trim().allow('').default(''),
});

// ── Bulk attendance — array of records ─────────
const attendanceRecordSchema = Joi.object({
  studentId: objectId.required(),
  status:    Joi.string().valid(...statusEnum).required(),
  remarks:   Joi.string().max(500).trim().allow('').default(''),
});

export const bulkAttendanceSchema = Joi.object({
  classId: objectId.required().messages({ 'any.required': 'Class is required' }),
  date:    Joi.date().iso().required().messages({ 'any.required': 'Date is required' }),
  records: Joi.array().items(attendanceRecordSchema).min(1).required().messages({
             'any.required': 'Attendance records are required',
             'array.min':    'At least one attendance record is required',
           }),
});

// ── Update a single record ────────────────────
export const updateAttendanceSchema = Joi.object({
  status:  Joi.string().valid(...statusEnum).messages({
             'any.only': `Status must be one of: ${statusEnum.join(', ')}`,
           }),
  remarks: Joi.string().max(500).trim().allow(''),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });
