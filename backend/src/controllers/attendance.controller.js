/**
 * ─────────────────────────────────────────────
 *  Controller — Attendance
 * ─────────────────────────────────────────────
 */

import { attendanceService } from '../services/attendance.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/attendance
export const listAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.list(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Attendance records retrieved successfully', result);
});

// GET /api/attendance/class/:classId?date=YYYY-MM-DD
export const getAttendanceByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const records = await attendanceService.getByClassAndDate(classId, date);
  return sendSuccess(res, HTTP_STATUS.OK, 'Class attendance retrieved successfully', records);
});

// GET /api/attendance/:id
export const getAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.getById(req.params.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Attendance record retrieved successfully', record);
});

// POST /api/attendance
export const createAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.create(req.body, req.user.id);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Attendance recorded successfully', record);
});

// POST /api/attendance/bulk
export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.bulkMark(req.body, req.user.id);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Bulk attendance marked successfully', result);
});

// PUT /api/attendance/:id
export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.update(req.params.id, req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Attendance updated successfully', record);
});
