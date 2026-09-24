/**
 * ─────────────────────────────────────────────
 *  Routes — Reports
 * ─────────────────────────────────────────────
 *  GET /api/reports/students
 *      ?classId=   &status=   &academicYear=
 *
 *  GET /api/reports/attendance
 *      ?classId=  &studentId=  &startDate=YYYY-MM-DD  &endDate=YYYY-MM-DD
 *
 *  GET /api/reports/fees
 *      ?academicYear=YYYY-YYYY  &classId=
 */

import { Router } from 'express';
import {
  studentSummaryReport,
  attendanceSummaryReport,
  feeSummaryReport,
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/students',   studentSummaryReport);
router.get('/attendance', attendanceSummaryReport);
router.get('/fees',       feeSummaryReport);

export default router;
