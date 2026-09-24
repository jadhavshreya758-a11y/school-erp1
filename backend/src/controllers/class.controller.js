/**
 * ─────────────────────────────────────────────
 *  Controller — Class Management
 * ─────────────────────────────────────────────
 */

import { classService } from '../services/class.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/classes
export const listClasses = asyncHandler(async (req, res) => {
  const result = await classService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Classes retrieved successfully', result);
});

// GET /api/classes/:id
export const getClass = asyncHandler(async (req, res) => {
  const cls = await classService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Class retrieved successfully', cls);
});

// POST /api/classes
export const createClass = asyncHandler(async (req, res) => {
  const cls = await classService.create(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Class created successfully', cls);
});

// PUT /api/classes/:id
export const updateClass = asyncHandler(async (req, res) => {
  const cls = await classService.update(req.params.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Class updated successfully', cls);
});

// DELETE /api/classes/:id
export const deleteClass = asyncHandler(async (req, res) => {
  await classService.remove(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Class deleted successfully');
});
