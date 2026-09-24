/**
 * ─────────────────────────────────────────────
 *  Service — Attendance
 * ─────────────────────────────────────────────
 *  Business rules:
 *   1. One attendance record per student per day (enforced by model index + service check).
 *   2. Bulk mark accepts an entire class in one call.
 *   3. Status values: present | absent | late | excused.
 */

import { attendanceRepository } from '../repositories/attendance.repository.js';
import { studentRepository }    from '../repositories/student.repository.js';
import { classRepository }      from '../repositories/class.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const attendanceService = {
  /**
   * List attendance with filters: classId, studentId, status,
   * startDate, endDate + pagination.
   */
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      classId:   query.classId   || '',
      studentId: query.studentId || '',
      status:    query.status    || '',
      startDate: query.startDate || '',
      endDate:   query.endDate   || '',
    };
    Object.keys(filters).forEach((k) => { if (!filters[k]) delete filters[k]; });
    const { data, total } = await attendanceRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  /**
   * Get attendance records for a class on a given date.
   * date param: ISO date string YYYY-MM-DD
   */
  getByClassAndDate: async (classId, date) => {
    const cls = await classRepository.findById(classId);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');
    const records = await attendanceRepository.findByClassAndDate(classId, date);
    return records;
  },

  getById: async (id) => {
    const record = await attendanceRepository.findById(id);
    if (!record) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Attendance record not found');
    return record;
  },

  /**
   * Create a single attendance record.
   * Prevents duplicate entry for same student+date.
   */
  create: async (body, userId) => {
    // Validate student exists
    const student = await studentRepository.findById(body.studentId);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');

    // Duplicate guard
    const duplicate = await attendanceRepository.findByStudentAndDate(body.studentId, body.date);
    if (duplicate) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Attendance already recorded for this student on this date',
      );
    }

    return attendanceRepository.create({ ...body, recordedBy: userId });
  },

  /**
   * Bulk mark attendance for an entire class on a given date.
   * Skips (does not throw) if a record already exists for a student.
   */
  bulkMark: async ({ classId, date, records }, userId) => {
    const cls = await classRepository.findById(classId);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');

    // Build docs; skip duplicates individually
    const toInsert = [];
    const skipped  = [];

    for (const r of records) {
      const exists = await attendanceRepository.findByStudentAndDate(r.studentId, date);
      if (exists) {
        skipped.push(r.studentId);
      } else {
        toInsert.push({
          studentId:  r.studentId,
          classId,
          date:       new Date(date),
          status:     r.status,
          remarks:    r.remarks || '',
          recordedBy: userId,
        });
      }
    }

    let inserted = [];
    if (toInsert.length) {
      inserted = await attendanceRepository.insertMany(toInsert);
    }

    return {
      inserted: inserted.length,
      skipped:  skipped.length,
      skippedIds: skipped,
    };
  },

  /**
   * Update status / remarks of an existing record.
   */
  update: async (id, body) => {
    const record = await attendanceRepository.findById(id);
    if (!record) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Attendance record not found');
    return attendanceRepository.updateById(id, body);
  },
};
