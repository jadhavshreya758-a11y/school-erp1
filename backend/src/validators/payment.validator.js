/**
 * ─────────────────────────────────────────────
 *  Validator — Payment
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

export const createPaymentSchema = Joi.object({
  studentId:            objectId.required().messages({ 'any.required': 'Student is required' }),
  feeId:                objectId.required().messages({ 'any.required': 'Fee structure is required' }),
  amountPaid:           Joi.number().min(1).required().messages({
                          'any.required': 'Amount paid is required',
                          'number.min':   'Amount paid must be greater than 0',
                        }),
  paymentDate:          Joi.date().iso().default(() => new Date()),
  paymentMethod:        Joi.string()
                          .valid('cash', 'bank_transfer', 'cheque', 'online', 'other')
                          .default('cash'),
  transactionReference: Joi.string().max(200).trim().allow('').default(''),
  remarks:              Joi.string().max(500).trim().allow('').default(''),
});
