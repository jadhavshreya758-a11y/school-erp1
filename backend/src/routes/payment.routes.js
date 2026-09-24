/**
 * ─────────────────────────────────────────────
 *  Routes — Payment Module
 * ─────────────────────────────────────────────
 *  GET  /api/payments                             — paginated history
 *  GET  /api/payments/summary/:studentId          — fee summary for student (?academicYear=)
 *  GET  /api/payments/:id                         — single payment detail
 *  POST /api/payments                             — record a payment
 */

import { Router } from 'express';
import {
  listPayments,
  getPayment,
  getStudentFeeSummary,
  recordPayment,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

router.use(authenticate);

// Static paths before :id param
router.get('/summary/:studentId', getStudentFeeSummary);

router.get('/',      listPayments);
router.get('/:id',   getPayment);
router.post('/',     validate(createPaymentSchema), recordPayment);

export default router;
