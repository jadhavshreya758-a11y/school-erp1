/**
 * ─────────────────────────────────────────────
 *  Routes — Authentication
 * ─────────────────────────────────────────────
 *  POST /api/auth/login
 *  GET  /api/auth/me
 *  POST /api/auth/logout
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { login, getMe, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, loginSchema } from '../validators/auth.validator.js';

const router = Router();

// Stricter rate-limit for login endpoint (5 attempts / 15 min)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login',  loginLimiter, validate(loginSchema), login);
router.get('/me',      authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
