/**
 * ─────────────────────────────────────────────
 *  Repository — User
 * ─────────────────────────────────────────────
 *  All direct Mongoose interactions for the User
 *  collection. No business logic here.
 */

import User from '../models/User.js';

export const userRepository = {
  /**
   * Find a user by email, optionally including the
   * hashed password (needed for login comparison).
   */
  findByEmail: (email, withPassword = false) => {
    const query = User.findOne({ email, deletedAt: null });
    if (withPassword) query.select('+password');
    return query.lean();
  },

  findById: (id) =>
    User.findOne({ _id: id, deletedAt: null }).lean(),

  create: (data) =>
    User.create(data),

  updateLastLogin: (id) =>
    User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true }),

  exists: (email) =>
    User.exists({ email, deletedAt: null }),
};
