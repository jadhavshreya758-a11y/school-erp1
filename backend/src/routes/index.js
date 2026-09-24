/**
 * ─────────────────────────────────────────────
 *  Route Loader — mounts all API sub-routers
 * ─────────────────────────────────────────────
 */
import { Router } from 'express';

import authRoutes     from './auth.routes.js';
import classRoutes    from './class.routes.js';
import parentRoutes   from './parent.routes.js';
import studentRoutes  from './student.routes.js';
import attendanceRoutes from './attendance.routes.js';
import feeRoutes      from './fee.routes.js';
import paymentRoutes  from './payment.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes   from './report.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth',       authRoutes);
router.use('/classes',    classRoutes);
router.use('/parents',    parentRoutes);
router.use('/students',   studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees',       feeRoutes);
router.use('/payments',   paymentRoutes);
router.use('/dashboard',  dashboardRoutes);
router.use('/reports',    reportRoutes);
router.use('/settings',   settingsRoutes);

export default router;
