/**
 * ─────────────────────────────────────────────
 *  Service — Dashboard
 * ─────────────────────────────────────────────
 *  Aggregates KPI data from all collections in
 *  parallel for maximum performance.
 *
 *  Returns:
 *   - totalStudents        — all non-deleted students
 *   - activeStudents       — status === 'active'
 *   - totalClasses         — non-deleted classes
 *   - totalParents         — non-deleted parents
 *   - todayAttendance      — { present, total, percentage }
 *   - collectedFees        — sum of all payments this academic year
 *   - pendingFees          — total fee amount − collected
 *   - recentPayments       — last 5 payments
 */

import { studentRepository }    from '../repositories/student.repository.js';
import { attendanceRepository } from '../repositories/attendance.repository.js';
import { paymentRepository }    from '../repositories/payment.repository.js';
import Class   from '../models/Class.js';
import Parent  from '../models/Parent.js';
import Fee     from '../models/Fee.js';

/**
 * Derive the current academic year string, e.g. "2025-2026".
 * Uses July 1 as the start-of-year cutoff (common school calendar).
 */
const getCurrentAcademicYear = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const dashboardService = {
  getKPIs: async () => {
    const academicYear = getCurrentAcademicYear();

    // Run all independent queries in parallel
    const [
      totalStudents,
      activeStudents,
      totalClasses,
      totalParents,
      todayPresent,
      todayTotal,
      collectedFees,
      recentPayments,
      totalFeeAmount,
    ] = await Promise.all([
      studentRepository.countTotal(),
      studentRepository.countActive(),

      Class.countDocuments({ deletedAt: null }),
      Parent.countDocuments({ deletedAt: null }),

      attendanceRepository.countTodayPresent(),
      attendanceRepository.countTodayTotal(),

      paymentRepository.sumCollectedByYear(academicYear),
      paymentRepository.recentPayments(5),

      // Total fee amount = sum of all active fee structures for current year
      Fee.aggregate([
        { $match: { academicYear, deletedAt: null, isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]).then((r) => (r.length ? r[0].total : 0)),
    ]);

    const pendingFees = Math.max(0, totalFeeAmount - collectedFees);

    const attendancePercentage =
      todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    return {
      academicYear,
      students: {
        total:  totalStudents,
        active: activeStudents,
      },
      classes: {
        total: totalClasses,
      },
      parents: {
        total: totalParents,
      },
      attendance: {
        todayPresent,
        todayTotal,
        percentage: attendancePercentage,
      },
      fees: {
        totalFeeAmount,
        collectedFees,
        pendingFees,
        collectionRate:
          totalFeeAmount > 0
            ? Math.round((collectedFees / totalFeeAmount) * 100)
            : 0,
      },
      recentPayments,
    };
  },
};
