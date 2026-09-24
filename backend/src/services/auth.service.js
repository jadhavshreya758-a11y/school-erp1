/**
 * ─────────────────────────────────────────────
 *  Service — Authentication
 * ─────────────────────────────────────────────
 *  Business logic: login, token generation,
 *  current-user retrieval.
 */

import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { audit } from './audit.service.js';

// ── Token helpers ─────────────────────────────
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const buildTokenPayload = (user) => ({
  id:    user._id,
  email: user.email,
  role:  user.role,
  name:  user.name,
});

// ── Service ───────────────────────────────────
export const authService = {
  /**
   * Validate credentials and return { token, user }.
   */
  login: async ({ email, password }) => {
    // Fetch user with password hash
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }
    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been deactivated');
    }

    // bcrypt compare via instance method — need Mongoose doc for that
    const { default: User } = await import('../models/User.js');
    const userDoc = await User.findOne({ email }).select('+password');
    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) {
      await audit.log({
        userId: userDoc._id, userEmail: email,
        module: 'auth', action: 'login_failed',
        description: audit.describe.loginFailed(email),
      });
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    await userRepository.updateLastLogin(userDoc._id);

    const token = signToken(buildTokenPayload(userDoc));
    // Return plain object without password
    const { password: _pw, ...safeUser } = userDoc.toJSON();

    await audit.log({
      userId: userDoc._id, userEmail: email,
      module: 'auth', action: 'login',
      description: audit.describe.login(email),
    });

    return { token, user: safeUser };
  },

  /**
   * Return the current authenticated user by ID.
   */
  getMe: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  },

  /**
   * Seed an admin user if none exists (called at startup).
   */
  seedAdmin: async () => {
    const { default: User } = await import('../models/User.js');
    const exists = await User.exists({});
    if (!exists) {
      await User.create({
        name:     process.env.ADMIN_NAME     || 'Super Admin',
        email:    process.env.ADMIN_EMAIL    || 'admin@schoolerp.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
        role:     'admin',
      });
      console.info('✅  Default admin user seeded');
    }
  },
};
