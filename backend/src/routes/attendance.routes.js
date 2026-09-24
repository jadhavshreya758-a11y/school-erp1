/**
 * ─────────────────────────────────────────────
 *  Routes — Attendance
 * ─────────────────────────────────────────────
 *  GET  /api/attendance                        — paginated history
 *  GET  /api/attendance/class/:classId         — class attendance for a date (?date=)
 *  GET  /api/attendance/:id                    — single record
 *  POST /api/attendance                        — record single attendance
 *  POST /api/attendance/bulk                   — bulk mark for a class
 *  PUT  /api/attendance/:id                    — update status/remarks
 */

import { Router } from 'express';
import {
  listAttendance,
  getAttendanceByClass,
  getAttendance,
  createAttendance,
  bulkMarkAttendance,
  updateAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  createAttendanceSchema,
  bulkAttendanceSchema,
  updateAttendanceSchema,
} from '../validators/attendance.validator.js';

const router = Router();

router.use(authenticate);

// Specific static paths before :id param
router.get('/class/:classId',  getAttendanceByClass);
router.post('/bulk',           validate(bulkAttendanceSchema), bulkMarkAttendance);

router.get('/',                listAttendance);
router.get('/:id',             getAttendance);
router.post('/',               validate(createAttendanceSchema), createAttendance);
router.put('/:id',             validate(updateAttendanceSchema), updateAttendance);

export default router;
