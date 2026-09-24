/**
 * ─────────────────────────────────────────────
 *  Service — Student Management
 * ─────────────────────────────────────────────
 */

import { studentRepository } from '../repositories/student.repository.js';
import { classRepository }   from '../repositories/class.repository.js';
import { parentRepository }  from '../repositories/parent.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { audit } from './audit.service.js';

export const studentService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      search:   query.search   || '',
      classId:  query.classId  || '',
      parentId: query.parentId || '',
      status:   query.status   || '',
    };
    // Remove empty filters
    Object.keys(filters).forEach((k) => { if (!filters[k]) delete filters[k]; });
    const { data, total } = await studentRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const student = await studentRepository.findById(id);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');
    return student;
  },

  bulkFetch: async (ids) => {
    const students = await studentRepository.findByIds(ids);
    return students;
  },

  create: async (body, userId = null, userEmail = 'system') => {
    // Unique student ID check
    const idConflict = await studentRepository.findByStudentId(body.studentId);
    if (idConflict) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Student ID "${body.studentId}" is already in use`);
    }

    // Validate class exists
    const cls = await classRepository.findById(body.classId);
    if (!cls) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Class not found');

    // Validate parent exists
    const parent = await parentRepository.findById(body.parentId);
    if (!parent) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Parent not found');

    const student = await studentRepository.create(body);

    await audit.log({
      userId, userEmail,
      module: 'student', action: 'create',
      recordId: student._id,
      description: audit.describe.create('Student', student._id),
    });

    return student;
  },

  update: async (id, body, userId = null, userEmail = 'system') => {
    const student = await studentRepository.findById(id);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');

    // If classId changing, validate
    if (body.classId && body.classId !== student.classId?._id?.toString()) {
      const cls = await classRepository.findById(body.classId);
      if (!cls) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Class not found');
    }

    // If parentId changing, validate
    if (body.parentId && body.parentId !== student.parentId?._id?.toString()) {
      const parent = await parentRepository.findById(body.parentId);
      if (!parent) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Parent not found');
    }

    const updated = await studentRepository.updateById(id, body);

    await audit.log({
      userId, userEmail,
      module: 'student', action: 'update',
      recordId: id,
      description: audit.describe.update('Student', id),
    });

    return updated;
  },

  remove: async (id, userId = null, userEmail = 'system') => {
    const student = await studentRepository.findById(id);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');

    const deleted = await studentRepository.softDeleteById(id);

    await audit.log({
      userId, userEmail,
      module: 'student', action: 'delete',
      recordId: id,
      description: audit.describe.delete('Student', id),
    });

    return deleted;
  },
};
