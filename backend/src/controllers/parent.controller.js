/**
 * ─────────────────────────────────────────────
 *  Controller — Parent Management
 * ─────────────────────────────────────────────
 */

import { parentService } from '../services/parent.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/parents
export const listParents = asyncHandler(async (req, res) => {
  const result = await parentService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Parents retrieved successfully', result);
});

// GET /api/parents/:id
export const getParent = asyncHandler(async (req, res) => {
  const parent = await parentService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Parent retrieved successfully', parent);
});

// GET /api/parents/:id/students
export const getParentWithStudents = asyncHandler(async (req, res) => {
  const result = await parentService.getWithStudents(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Parent with students retrieved successfully', result);
});

// POST /api/parents
export const createParent = asyncHandler(async (req, res) => {
  const parent = await parentService.create(req.body);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Parent created successfully', parent);
});

// PUT /api/parents/:id
export const updateParent = asyncHandler(async (req, res) => {
  const parent = await parentService.update(req.params.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Parent updated successfully', parent);
});

// DELETE /api/parents/:id
export const deleteParent = asyncHandler(async (req, res) => {
  await parentService.remove(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Parent deleted successfully');
});
