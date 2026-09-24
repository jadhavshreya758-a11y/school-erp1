/**
 * ─────────────────────────────────────────────
 *  Controller — Payment Module
 * ─────────────────────────────────────────────
 */

import { paymentService } from '../services/payment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/payments
export const listPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Payments retrieved successfully', result);
});

// GET /api/payments/:id
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Payment retrieved successfully', payment);
});

// GET /api/payments/summary/:studentId?academicYear=YYYY-YYYY
export const getStudentFeeSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;
  if (!academicYear) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'academicYear query param is required (format: YYYY-YYYY)',
    });
  }
  const summary = await paymentService.getStudentFeeSummary(studentId, academicYear);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee summary retrieved successfully', summary);
});

// POST /api/payments
export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(req.body, req.user.id);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Payment recorded successfully', payment);
});
