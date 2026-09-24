/**
 * ─────────────────────────────────────────────
 *  Controller — Student Management
 * ─────────────────────────────────────────────
 */

import { studentService } from '../services/student.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/students
export const listStudents = asyncHandler(async (req, res) => {
  const result = await studentService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Students retrieved successfully', result);
});

// GET /api/students/:id
export const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Student retrieved successfully', student);
});

// POST /api/students/bulk
export const bulkFetchStudents = asyncHandler(async (req, res) => {
  const students = await studentService.bulkFetch(req.body.ids);
  return sendSuccess(res, HTTP_STATUS.OK, 'Students retrieved successfully', students);
});

// POST /api/students
export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.create(req.body, req.user.id, req.user.email);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Student created successfully', student);
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.update(req.params.id, req.body, req.user.id, req.user.email);
  return sendSuccess(res, HTTP_STATUS.OK, 'Student updated successfully', student);
});

// DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.remove(req.params.id, req.user.id, req.user.email);
  return sendSuccess(res, HTTP_STATUS.OK, 'Student deleted successfully');
});
