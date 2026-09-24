/**
 * ─────────────────────────────────────────────
 *  Controller — Fee Structure
 * ─────────────────────────────────────────────
 */

import { feeService } from '../services/fee.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/fees
export const listFees = asyncHandler(async (req, res) => {
  const result = await feeService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee structures retrieved successfully', result);
});

// GET /api/fees/:id
export const getFee = asyncHandler(async (req, res) => {
  const fee = await feeService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure retrieved successfully', fee);
});

// POST /api/fees
export const createFee = asyncHandler(async (req, res) => {
  const fee = await feeService.create(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Fee structure created successfully', fee);
});

// PUT /api/fees/:id
export const updateFee = asyncHandler(async (req, res) => {
  const fee = await feeService.update(req.params.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure updated successfully', fee);
});

// DELETE /api/fees/:id
export const deleteFee = asyncHandler(async (req, res) => {
  await feeService.remove(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee structure deleted successfully');
});
