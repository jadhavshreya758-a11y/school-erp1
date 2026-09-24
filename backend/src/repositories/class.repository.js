/**
 * ─────────────────────────────────────────────
 *  Repository — Class
 * ─────────────────────────────────────────────
 */

import Class from '../models/Class.js';

export const classRepository = {
  /**
   * Paginated list with optional search & filters.
   * @param {object} filters  - { search, academicYear, isActive }
   * @param {object} options  - { skip, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.search) {
      query.$or = [
        { name:    { $regex: filters.search, $options: 'i' } },
        { section: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      Class.find(query)
        .sort(options.sort || { name: 1, section: 1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Class.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Class.findById(id).lean(),

  findByNameSectionYear: (name, section, academicYear) =>
    Class.findOne({ name, section, academicYear }).lean(),

  create: (data) =>
    Class.create(data),

  updateById: (id, data) =>
    Class.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean(),

  /** Soft delete */
  softDeleteById: (id) =>
    Class.findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true }).lean(),

  /** Count students currently assigned to this class */
  countStudents: async (classId) => {
    const Student = (await import('../models/Student.js')).default;
    return Student.countDocuments({ classId, deletedAt: null });
  },
};
