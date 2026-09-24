/**
 * ─────────────────────────────────────────────
 *  Routes — Fee Structure
 * ─────────────────────────────────────────────
 *  GET    /api/fees
 *  GET    /api/fees/:id
 *  POST   /api/fees
 *  PUT    /api/fees/:id
 *  DELETE /api/fees/:id
 */

import { Router } from 'express';
import {
  listFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
} from '../controllers/fee.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createFeeSchema, updateFeeSchema } from '../validators/fee.validator.js';

const router = Router();

router.use(authenticate);

router.get('/',     listFees);
router.get('/:id',  getFee);
router.post('/',    validate(createFeeSchema), createFee);
router.put('/:id',  validate(updateFeeSchema), updateFee);
router.delete('/:id', deleteFee);

export default router;
