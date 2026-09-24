/**
 * ─────────────────────────────────────────────
 *  Service — Reports
 * ─────────────────────────────────────────────
 *  Three summary reports, each driven by MongoDB
 *  aggregation pipelines:
 *
 *  1. studentSummary   — enrollment stats by class
 *  2. attendanceSummary — present/absent counts by class + date range
 *  3. feeSummary       — collected / pending per class for a year
 */

import mongoose from 'mongoose';
import Student    from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Fee        from '../models/Fee.js';
import Payment    from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ── Helper — build a date-range match ────────
const dateRangeMatch = (startDate, endDate, field = 'date') => {
  if (!startDate && !endDate) return {};
  const cond = {};
  if (startDate) {
    const s = new Date(startDate);
    s.setUTCHours(0, 0, 0, 0);
    cond.$gte = s;
  }
  if (endDate) {
    const e = new Date(endDate);
    e.setUTCHours(23, 59, 59, 999);
    cond.$lte = e;
  }
  return { [field]: cond };
};

export const reportService = {
  /**
   * Student Summary — enrollment counts grouped by class.
   * Filters: classId, status, academicYear (of the class)
   */
  studentSummary: async (query) => {
    const match = { deletedAt: null };
    if (query.classId) match.classId = toObjectId(query.classId);
    if (query.status)  match.status  = query.status;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from:         'classes',
          localField:   'classId',
          foreignField: '_id',
          as:           'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmpty: false } },
    ];

    // Optional filter by class academicYear
    if (query.academicYear) {
      pipeline.push({ $match: { 'class.academicYear': query.academicYear } });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            classId:      '$classId',
            className:    '$class.name',
            section:      '$class.section',
            academicYear: '$class.academicYear',
          },
          total:       { $sum: 1 },
          active:      { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive:    { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          transferred: { $sum: { $cond: [{ $eq: ['$status', 'transferred'] }, 1, 0] } },
          graduated:   { $sum: { $cond: [{ $eq: ['$status', 'graduated'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id:          0,
          classId:      '$_id.classId',
          className:    '$_id.className',
          section:      '$_id.section',
          academicYear: '$_id.academicYear',
          total:        1,
          active:       1,
          inactive:     1,
          transferred:  1,
          graduated:    1,
        },
      },
      { $sort: { academicYear: -1, className: 1, section: 1 } },
    );

    const rows = await Student.aggregate(pipeline);

    const grandTotal = rows.reduce(
      (acc, r) => {
        acc.total       += r.total;
        acc.active      += r.active;
        acc.inactive    += r.inactive;
        acc.transferred += r.transferred;
        acc.graduated   += r.graduated;
        return acc;
      },
      { total: 0, active: 0, inactive: 0, transferred: 0, graduated: 0 },
    );

    return { rows, summary: grandTotal };
  },

  /**
   * Attendance Summary — present/absent counts grouped by class + day.
   * Filters: classId, studentId, startDate, endDate
   */
  attendanceSummary: async (query) => {
    if (!query.startDate || !query.endDate) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'startDate and endDate are required for attendance report (format: YYYY-MM-DD)',
      );
    }

    const match = {
      ...dateRangeMatch(query.startDate, query.endDate, 'date'),
    };
    if (query.classId)   match.classId   = toObjectId(query.classId);
    if (query.studentId) match.studentId = toObjectId(query.studentId);

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from:         'classes',
          localField:   'classId',
          foreignField: '_id',
          as:           'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmpty: false } },
      {
        $group: {
          _id: {
            classId:   '$classId',
            className: '$class.name',
            section:   '$class.section',
          },
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id:       0,
          classId:   '$_id.classId',
          className: '$_id.className',
          section:   '$_id.section',
          total:     1,
          present:   1,
          absent:    1,
          late:      1,
          excused:   1,
          presentPct: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { className: 1, section: 1 } },
    ];

    const rows = await Attendance.aggregate(pipeline);

    const grandTotal = rows.reduce(
      (acc, r) => {
        acc.total   += r.total;
        acc.present += r.present;
        acc.absent  += r.absent;
        acc.late    += r.late;
        acc.excused += r.excused;
        return acc;
      },
      { total: 0, present: 0, absent: 0, late: 0, excused: 0 },
    );
    grandTotal.presentPct =
      grandTotal.total > 0
        ? Math.round((grandTotal.present / grandTotal.total) * 100 * 10) / 10
        : 0;

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      rows,
      summary: grandTotal,
    };
  },

  /**
   * Fee Summary — collected / pending per class for an academic year.
   * Requires: academicYear query param.
   * Optional: classId filter.
   */
  feeSummary: async (query) => {
    if (!query.academicYear) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'academicYear is required for fee report (format: YYYY-YYYY)',
      );
    }

    const { academicYear } = query;

    // 1. Get all fee structures for the year
    const feeMatch = { academicYear, deletedAt: null };
    if (query.classId) feeMatch.classId = toObjectId(query.classId);

    const fees = await Fee.find(feeMatch)
      .populate('classId', 'name section')
      .lean();

    if (!fees.length) {
      return { academicYear, rows: [], summary: { totalFee: 0, collected: 0, pending: 0 } };
    }

    // 2. For each fee, sum collected payments
    const rows = await Promise.all(
      fees.map(async (fee) => {
        const result = await Payment.aggregate([
          { $match: { feeId: fee._id, academicYear } },
          { $group: { _id: null, collected: { $sum: '$amountPaid' } } },
        ]);
        const collected = result.length ? result[0].collected : 0;
        const pending   = Math.max(0, fee.totalAmount - collected);
        return {
          feeId:       fee._id,
          classId:     fee.classId?._id,
          className:   fee.classId?.name,
          section:     fee.classId?.section,
          academicYear,
          totalFee:    fee.totalAmount,
          collected,
          pending,
          collectionRate:
            fee.totalAmount > 0
              ? Math.round((collected / fee.totalAmount) * 100)
              : 0,
        };
      }),
    );

    const summary = rows.reduce(
      (acc, r) => {
        acc.totalFee  += r.totalFee;
        acc.collected += r.collected;
        acc.pending   += r.pending;
        return acc;
      },
      { totalFee: 0, collected: 0, pending: 0 },
    );
    summary.collectionRate =
      summary.totalFee > 0
        ? Math.round((summary.collected / summary.totalFee) * 100)
        : 0;

    return { academicYear, rows, summary };
  },
};
