/**
 * ─────────────────────────────────────────────
 *  Service — Parent Management
 * ─────────────────────────────────────────────
 */

import { parentRepository } from '../repositories/parent.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const parentService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      search:   query.search   || '',
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
    };
    const { data, total } = await parentRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const parent = await parentRepository.findById(id);
    if (!parent) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Parent not found');
    return parent;
  },

  getWithStudents: async (id) => {
    const parent = await parentRepository.findById(id);
    if (!parent) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Parent not found');
    const students = await parentRepository.findStudentsByParent(id);
    return { ...parent, students };
  },

  create: async (body) => {
    const existing = await parentRepository.findByEmail(body.email);
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `A parent with email "${body.email}" already exists`);
    }
    return parentRepository.create(body);
  },

  update: async (id, body) => {
    const parent = await parentRepository.findById(id);
    if (!parent) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Parent not found');

    // If email is being changed, check uniqueness
    if (body.email && body.email !== parent.email) {
      const conflict = await parentRepository.findByEmail(body.email);
      if (conflict) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `A parent with email "${body.email}" already exists`);
      }
    }

    return parentRepository.updateById(id, body);
  },

  remove: async (id) => {
    const parent = await parentRepository.findById(id);
    if (!parent) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Parent not found');

    // Guard: cannot delete parent that still has active students
    const students = await parentRepository.findStudentsByParent(id);
    if (students.length > 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Cannot delete parent with ${students.length} linked student(s). Reassign or remove students first.`,
      );
    }

    return parentRepository.softDeleteById(id);
  },
};
