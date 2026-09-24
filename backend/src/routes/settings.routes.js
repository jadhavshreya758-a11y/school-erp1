/**
 * ─────────────────────────────────────────────
 *  Routes — School Settings
 * ─────────────────────────────────────────────
 *  GET /api/settings
 *  PUT /api/settings
 */

import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, updateSettingsSchema } from '../validators/settings.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/', validate(updateSettingsSchema), updateSettings);

export default router;
