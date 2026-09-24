/**
 * ─────────────────────────────────────────────
 *  Repository — Payment
 * ─────────────────────────────────────────────
 */

import Payment from '../models/Payment.js';

export const paymentRepository = {
  /**
   * Paginated history with filters.
   * @param {object} filters - { studentId, feeId, academicYear, paymentMethod, startDate, endDate }
   * @param {object} options - { skip, limit, sort }
   */
  findAll: async (filters = {}, options = {}) => {
    const query = {};

    if (filters.studentId)    query.studentId    = filters.studentId;
    if (filters.feeId)        query.feeId        = filters.feeId;
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.paymentMethod)query.paymentMethod= filters.paymentMethod;

    if (filters.startDate || filters.endDate) {
      query.paymentDate = {};
      if (filters.startDate) {
        const s = new Date(filters.startDate);
        s.setUTCHours(0, 0, 0, 0);
        query.paymentDate.$gte = s;
      }
      if (filters.endDate) {
        const e = new Date(filters.endDate);
        e.setUTCHours(23, 59, 59, 999);
        query.paymentDate.$lte = e;
      }
    }

    const [data, total] = await Promise.all([
      Payment.find(query)
        .populate('studentId',  'firstName lastName studentId')
        .populate('feeId',      'totalAmount academicYear classId')
        .populate('recordedBy', 'name')
        .sort(options.sort || { paymentDate: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return { data, total };
  },

  findById: (id) =>
    Payment.findById(id)
      .populate('studentId',  'firstName lastName studentId classId')
      .populate('feeId',      'totalAmount academicYear classId breakdown')
      .populate('recordedBy', 'name')
      .lean(),

  findByReceiptNumber: (receiptNumber) =>
    Payment.findOne({ receiptNumber }).lean(),

  /**
   * Sum of all payments for a student in a given academic year.
   * Used to calculate pending fees and prevent overpayment.
   */
  sumPaidByStudentAndYear: async (studentId, academicYear) => {
    const result = await Payment.aggregate([
      { $match: { studentId: new (await import('mongoose')).default.Types.ObjectId(studentId), academicYear } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    return result.length ? result[0].total : 0;
  },

  create: (data) =>
    Payment.create(data),

  /**
   * Generate a sequential receipt number: RCP-YYYYMMDD-XXXX
   */
  generateReceiptNumber: async () => {
    const today     = new Date();
    const datePart  = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count     = await Payment.countDocuments();
    const seq       = String(count + 1).padStart(4, '0');
    return `RCP-${datePart}-${seq}`;
  },

  // ── Dashboard / Reports helpers ───────────────

  sumCollectedByYear: async (academicYear) => {
    const match = academicYear ? { academicYear } : {};
    const result = await Payment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    return result.length ? result[0].total : 0;
  },

  recentPayments: (limit = 5) =>
    Payment.find()
      .populate('studentId', 'firstName lastName studentId')
      .sort({ paymentDate: -1 })
      .limit(limit)
      .lean(),
};
