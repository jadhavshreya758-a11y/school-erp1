/**
 * ─────────────────────────────────────────────
 *  Controller — Authentication
 * ─────────────────────────────────────────────
 *  Handles HTTP request/response only.
 *  All logic delegated to authService.
 */

import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { audit } from '../services/audit.service.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  return sendSuccess(res, HTTP_STATUS.OK, 'Login successful', { token, user });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, HTTP_STATUS.OK, 'Current user retrieved', user);
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless; client must discard the token.
  await audit.log({
    userId:      req.user.id,
    userEmail:   req.user.email,
    module:      'auth',
    action:      'logout',
    description: audit.describe.logout(req.user.email),
  });
  return sendSuccess(res, HTTP_STATUS.OK, 'Logged out successfully');
});
