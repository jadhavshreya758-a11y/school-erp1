/**
 * ─────────────────────────────────────────────
 *  Application Constants
 * ─────────────────────────────────────────────
 */

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

export const FEE_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
});

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
});
