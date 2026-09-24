/**
 * ─────────────────────────────────────────────
 *  Controller — Reports
 * ─────────────────────────────────────────────
 */

import { reportService } from '../services/report.service.js';
import { asyncHandler }  from '../utils/asyncHandler.js';
import { sendSuccess }   from '../utils/apiResponse.js';
import { HTTP_STATUS }   from '../constants/httpStatus.js';

// GET /api/reports/students
export const studentSummaryReport = asyncHandler(async (req, res) => {
  const data = await reportService.studentSummary(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Student summary report retrieved', data);
});

// GET /api/reports/attendance
export const attendanceSummaryReport = asyncHandler(async (req, res) => {
  const data = await reportService.attendanceSummary(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Attendance summary report retrieved', data);
});

// GET /api/reports/fees
export const feeSummaryReport = asyncHandler(async (req, res) => {
  const data = await reportService.feeSummary(req.query);
  return sendSuccess(res, HTTP_STATUS.OK, 'Fee summary report retrieved', data);
});
