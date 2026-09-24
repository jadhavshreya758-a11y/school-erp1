/**
 * ─────────────────────────────────────────────
 *  Repository — Parent
 * ─────────────────────────────────────────────
 */

import Parent from '../models/Parent.js';

export const parentRepository = {
  /**
   * Paginated list with optional search & filters.
   * @param {object} filters  - { search, isActive }
   * @param {object} options  - { skip, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.search) {
      query.$or = [
        { name:  { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      Parent.find(query)
        .sort(options.sort || { name: 1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Parent.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Parent.findById(id).lean(),

  findByEmail: (email) =>
    Parent.findOne({ email }).lean(),

  create: (data) =>
    Parent.create(data),

  updateById: (id, data) =>
    Parent.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean(),

  softDeleteById: (id) =>
    Parent.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true },
    ).lean(),

  /** Return all students linked to this parent */
  findStudentsByParent: async (parentId) => {
    const Student = (await import('../models/Student.js')).default;
    return Student.find({ parentId, deletedAt: null })
      .populate('classId', 'name section academicYear')
      .lean();
  },
};
