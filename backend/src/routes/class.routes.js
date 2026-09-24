/**
 * ─────────────────────────────────────────────
 *  Routes — Class Management
 * ─────────────────────────────────────────────
 *  GET    /api/classes
 *  GET    /api/classes/:id
 *  POST   /api/classes
 *  PUT    /api/classes/:id
 *  DELETE /api/classes/:id
 */

import { Router } from 'express';
import {
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/class.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createClassSchema, updateClassSchema } from '../validators/class.validator.js';

const router = Router();

// All class routes require authentication
router.use(authenticate);

router.get('/',     listClasses);
router.get('/:id',  getClass);
router.post('/',    validate(createClassSchema), createClass);
router.put('/:id',  validate(updateClassSchema), updateClass);
router.delete('/:id', deleteClass);

export default router;
