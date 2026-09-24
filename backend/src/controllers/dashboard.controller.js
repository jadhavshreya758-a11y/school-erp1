/**
 * ─────────────────────────────────────────────
 *  Controller — Dashboard
 * ─────────────────────────────────────────────
 */

import { dashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/dashboard
export const getDashboard = asyncHandler(async (_req, res) => {
  const kpis = await dashboardService.getKPIs();
  return sendSuccess(res, HTTP_STATUS.OK, 'Dashboard data retrieved successfully', kpis);
});
