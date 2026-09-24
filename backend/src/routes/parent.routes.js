/**
 * ─────────────────────────────────────────────
 *  Routes — Parent Management
 * ─────────────────────────────────────────────
 *  GET    /api/parents
 *  GET    /api/parents/:id
 *  GET    /api/parents/:id/students
 *  POST   /api/parents
 *  PUT    /api/parents/:id
 *  DELETE /api/parents/:id
 */

import { Router } from 'express';
import {
  listParents,
  getParent,
  getParentWithStudents,
  createParent,
  updateParent,
  deleteParent,
} from '../controllers/parent.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createParentSchema, updateParentSchema } from '../validators/parent.validator.js';

const router = Router();

router.use(authenticate);

router.get('/',               listParents);
router.get('/:id',            getParent);
router.get('/:id/students',   getParentWithStudents);
router.post('/',              validate(createParentSchema), createParent);
router.put('/:id',            validate(updateParentSchema), updateParent);
router.delete('/:id',         deleteParent);

export default router;
