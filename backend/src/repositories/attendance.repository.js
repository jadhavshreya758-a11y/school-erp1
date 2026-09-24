/**
 * ─────────────────────────────────────────────
 *  Repository — Attendance
 * ─────────────────────────────────────────────
 */

import Attendance from '../models/Attendance.js';

export const attendanceRepository = {
  /**
   * Find a single record by studentId + date (duplicate check).
   */
  findByStudentAndDate: (studentId, date) => {
    // Normalise to midnight UTC for the comparison
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    return Attendance.findOne({ studentId, date: { $gte: start, $lte: end } }).lean();
  },

  /**
   * Get attendance records for a class on a specific date.
   */
  findByClassAndDate: (classId, date) => {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    return Attendance.find({ classId, date: { $gte: start, $lte: end } })
      .populate('studentId', 'firstName lastName studentId')
      .lean();
  },

  /**
   * Paginated history with date-range + class + student filters.
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.classId)   query.classId   = filters.classId;
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.status)    query.status    = filters.status;

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        const s = new Date(filters.startDate);
        s.setUTCHours(0, 0, 0, 0);
        query.date.$gte = s;
      }
      if (filters.endDate) {
        const e = new Date(filters.endDate);
        e.setUTCHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    const [data, total] = await Promise.all([
      Attendance.find(query)
        .populate('studentId', 'firstName lastName studentId')
        .populate('classId',   'name section')
        .populate('recordedBy','name')
        .sort(options.sort || { date: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Attendance.findById(id)
      .populate('studentId', 'firstName lastName studentId')
      .populate('classId',   'name section')
      .lean(),

  create: (data) =>
    Attendance.create(data),

  /** Insert many in one call — used for bulk mark */
  insertMany: (records) =>
    Attendance.insertMany(records, { ordered: false }),

  updateById: (id, data) =>
    Attendance.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean(),

  /**
   * Count today's present students across all classes.
   */
  countTodayPresent: () => {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    return Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: 'present' });
  },

  /**
   * Count today's total attendance records.
   */
  countTodayTotal: () => {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
    return Attendance.countDocuments({ date: { $gte: start, $lte: end } });
  },
};
