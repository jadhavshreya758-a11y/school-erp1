/**
 * ─────────────────────────────────────────────
 *  Repository — Fee Structure
 * ─────────────────────────────────────────────
 */

import Fee from '../models/Fee.js';

export const feeRepository = {
  /**
   * Paginated list with filters.
   * @param {object} filters  - { classId, academicYear, isActive }
   * @param {object} options  - { skip, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.classId)      query.classId      = filters.classId;
    if (filters.academicYear) query.academicYear  = filters.academicYear;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      Fee.find(query)
        .populate('classId', 'name section academicYear')
        .sort(options.sort || { academicYear: -1, createdAt: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Fee.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Fee.findById(id)
      .populate('classId', 'name section academicYear')
      .lean(),

  findByClassAndYear: (classId, academicYear) =>
    Fee.findOne({ classId, academicYear }).lean(),

  create: (data) =>
    Fee.create(data),

  updateById: (id, data) =>
    Fee.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('classId', 'name section academicYear')
      .lean(),

  softDeleteById: (id) =>
    Fee.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true },
    ).lean(),

  /**
   * Get fee structure for a specific class + academic year.
   * Used by the payment module to determine total due.
   */
  getFeeAmount: async (classId, academicYear) => {
    const fee = await Fee.findOne({ classId, academicYear, deletedAt: null }).lean();
    return fee ? fee.totalAmount : 0;
  },
};
