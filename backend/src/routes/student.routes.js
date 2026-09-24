/**
 * ─────────────────────────────────────────────
 *  Routes — Student Management
 * ─────────────────────────────────────────────
 *  GET    /api/students
 *  GET    /api/students/:id
 *  POST   /api/students/bulk        (bulk fetch by IDs)
 *  POST   /api/students
 *  PUT    /api/students/:id
 *  DELETE /api/students/:id
 */

import { Router } from 'express';
import {
  listStudents,
  getStudent,
  bulkFetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller.js';
import { authenticate } from '../middleware/auth.js';
import {
  validate,
  createStudentSchema,
  updateStudentSchema,
  bulkFetchSchema,
} from '../validators/student.validator.js';

const router = Router();

router.use(authenticate);

// Specific routes before :id param routes
router.post('/bulk',  validate(bulkFetchSchema), bulkFetchStudents);

router.get('/',       listStudents);
router.get('/:id',    getStudent);
router.post('/',      validate(createStudentSchema), createStudent);
router.put('/:id',    validate(updateStudentSchema), updateStudent);
router.delete('/:id', deleteStudent);

export default router;
