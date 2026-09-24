/**
 * ─────────────────────────────────────────────
 *  Service — Class Management
 * ─────────────────────────────────────────────
 */

import { classRepository } from '../repositories/class.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const classService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      search:       query.search       || '',
      academicYear: query.academicYear || '',
      isActive:     query.isActive !== undefined ? query.isActive === 'true' : undefined,
    };
    const { data, total } = await classRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const cls = await classRepository.findById(id);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');
    return cls;
  },

  create: async (body) => {
    // Uniqueness check: name + section + academicYear
    const existing = await classRepository.findByNameSectionYear(
      body.name,
      body.section || '',
      body.academicYear,
    );
    if (existing) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Class "${body.name}${body.section ? ' – ' + body.section : ''}" already exists for ${body.academicYear}`,
      );
    }
    return classRepository.create(body);
  },

  update: async (id, body) => {
    const cls = await classRepository.findById(id);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');

    // If name/section/year changed, re-check uniqueness
    const name         = body.name         ?? cls.name;
    const section      = body.section      ?? cls.section;
    const academicYear = body.academicYear ?? cls.academicYear;

    const conflict = await classRepository.findByNameSectionYear(name, section, academicYear);
    if (conflict && conflict._id.toString() !== id) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Class "${name}${section ? ' – ' + section : ''}" already exists for ${academicYear}`,
      );
    }

    return classRepository.updateById(id, body);
  },

  remove: async (id) => {
    const cls = await classRepository.findById(id);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');

    // Guard: cannot delete class that still has students
    const studentCount = await classRepository.countStudents(id);
    if (studentCount > 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Cannot delete class with ${studentCount} enrolled student(s). Reassign students first.`,
      );
    }

    return classRepository.softDeleteById(id);
  },
};
