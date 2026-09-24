/**
 * ─────────────────────────────────────────────
 *  Repository — Student
 * ─────────────────────────────────────────────
 */

import Student from '../models/Student.js';

export const studentRepository = {
  /**
   * Paginated list with search + filters.
   * @param {object} filters  - { search, classId, status, parentId }
   * @param {object} options  - { skip, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName:  { $regex: filters.search, $options: 'i' } },
        { studentId: { $regex: filters.search, $options: 'i' } },
        { email:     { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.classId)  query.classId  = filters.classId;
    if (filters.parentId) query.parentId = filters.parentId;
    if (filters.status)   query.status   = filters.status;

    const [data, total] = await Promise.all([
      Student.find(query)
        .populate('classId',  'name section academicYear')
        .populate('parentId', 'name email phone')
        .sort(options.sort || { firstName: 1, lastName: 1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Student.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Student.findById(id)
      .populate('classId',  'name section academicYear displayName')
      .populate('parentId', 'name email phone relation')
      .lean(),

  findByStudentId: (studentId) =>
    Student.findOne({ studentId: studentId.toUpperCase() }).lean(),

  findByIds: (ids) =>
    Student.find({ _id: { $in: ids } })
      .populate('classId',  'name section academicYear')
      .populate('parentId', 'name email phone')
      .lean(),

  create: (data) =>
    Student.create(data),

  updateById: (id, data) =>
    Student.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('classId',  'name section academicYear')
      .populate('parentId', 'name email phone')
      .lean(),

  softDeleteById: (id) =>
    Student.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), status: 'inactive' },
      { new: true },
    ).lean(),

  countByClass: (classId) =>
    Student.countDocuments({ classId, deletedAt: null, status: 'active' }),

  countActive: () =>
    Student.countDocuments({ status: 'active', deletedAt: null }),

  countTotal: () =>
    Student.countDocuments({ deletedAt: null }),
};
