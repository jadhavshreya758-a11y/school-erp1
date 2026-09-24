/**
 * ─────────────────────────────────────────────
 *  Service — Fee Structure
 * ─────────────────────────────────────────────
 *  Business rules:
 *   1. One fee record per class per academic year.
 *   2. classId must reference an existing Class.
 *   3. academicYear on Fee must match the class's academicYear.
 */

import { feeRepository }   from '../repositories/fee.repository.js';
import { classRepository } from '../repositories/class.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

export const feeService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      classId:      query.classId      || '',
      academicYear: query.academicYear || '',
      isActive:     query.isActive !== undefined ? query.isActive === 'true' : undefined,
    };
    Object.keys(filters).forEach((k) => {
      if (filters[k] === '' || filters[k] === undefined) delete filters[k];
    });
    const { data, total } = await feeRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const fee = await feeRepository.findById(id);
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee structure not found');
    return fee;
  },

  create: async (body) => {
    // Validate class exists
    const cls = await classRepository.findById(body.classId);
    if (!cls) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Class not found');

    // Enforce one fee per class per academic year
    const existing = await feeRepository.findByClassAndYear(body.classId, body.academicYear);
    if (existing) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `A fee structure for this class already exists for academic year ${body.academicYear}`,
      );
    }

    return feeRepository.create(body);
  },

  update: async (id, body) => {
    const fee = await feeRepository.findById(id);
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee structure not found');

    // classId and academicYear are immutable after creation
    // (changing them would break payment references)
    return feeRepository.updateById(id, body);
  },

  remove: async (id) => {
    const fee = await feeRepository.findById(id);
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee structure not found');

    // Guard: cannot delete fee structure that has payments
    const Payment = (await import('../models/Payment.js')).default;
    const paymentCount = await Payment.countDocuments({ feeId: id });
    if (paymentCount > 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Cannot delete fee structure with ${paymentCount} linked payment(s)`,
      );
    }

    return feeRepository.softDeleteById(id);
  },
};
