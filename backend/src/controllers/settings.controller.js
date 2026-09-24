/**
 * ─────────────────────────────────────────────
 *  Controller — School Settings
 * ─────────────────────────────────────────────
 */

import { settingsService } from '../services/settings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

// GET /api/settings
export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.get();
  return sendSuccess(res, HTTP_STATUS.OK, 'School settings retrieved successfully', settings);
});

// PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.update(req.body, req.user.id, req.user.email);
  return sendSuccess(res, HTTP_STATUS.OK, 'School settings updated successfully', settings);
});
