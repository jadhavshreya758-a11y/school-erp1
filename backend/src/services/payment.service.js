/**
 * ─────────────────────────────────────────────
 *  Service — Payment Module
 * ─────────────────────────────────────────────
 *  Business rules:
 *   1. Payment must reference a valid Student + Fee.
 *   2. amountPaid cannot cause total paid > fee.totalAmount (no overpayment).
 *   3. Receipt number is auto-generated — never user-supplied.
 *   4. Pending fee = totalAmount − totalPaid (floored at 0).
 */

import mongoose from 'mongoose';
import { paymentRepository } from '../repositories/payment.repository.js';
import { studentRepository } from '../repositories/student.repository.js';
import { feeRepository }     from '../repositories/fee.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { audit } from './audit.service.js';

export const paymentService = {
  list: async (query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      studentId:     query.studentId     || '',
      feeId:         query.feeId         || '',
      academicYear:  query.academicYear  || '',
      paymentMethod: query.paymentMethod || '',
      startDate:     query.startDate     || '',
      endDate:       query.endDate       || '',
    };
    Object.keys(filters).forEach((k) => { if (!filters[k]) delete filters[k]; });
    const { data, total } = await paymentRepository.findAll(filters, { skip, limit });
    return { data, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (id) => {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payment not found');
    return payment;
  },

  /**
   * Return fee summary for a student:
   * totalFee, totalPaid, pendingAmount, payments[].
   */
  getStudentFeeSummary: async (studentId, academicYear) => {
    const student = await studentRepository.findById(studentId);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');

    // Resolve classId (could be populated object or raw ObjectId)
    const classId = student.classId?._id ?? student.classId;

    const fee = await feeRepository.findByClassAndYear(
      classId.toString(),
      academicYear,
    );

    const totalFee   = fee ? fee.totalAmount : 0;
    const totalPaid  = await paymentRepository.sumPaidByStudentAndYear(studentId, academicYear);
    const pending    = Math.max(0, totalFee - totalPaid);

    const { data: payments } = await paymentRepository.findAll(
      { studentId, academicYear },
      { limit: 100 },
    );

    return {
      student:      { id: student._id, name: `${student.firstName} ${student.lastName}`, studentId: student.studentId },
      academicYear,
      feeStructure: fee || null,
      totalFee,
      totalPaid,
      pendingAmount: pending,
      status:        pending === 0 && totalFee > 0 ? 'paid' : pending === totalFee ? 'pending' : 'partial',
      payments,
    };
  },

  recordPayment: async (body, userId) => {
    // 1. Validate student
    const student = await studentRepository.findById(body.studentId);
    if (!student) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Student not found');

    // 2. Validate fee structure
    const fee = await feeRepository.findById(body.feeId);
    if (!fee) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee structure not found');

    // 3. Overpayment guard
    const alreadyPaid = await paymentRepository.sumPaidByStudentAndYear(
      body.studentId,
      fee.academicYear,
    );
    const remaining = fee.totalAmount - alreadyPaid;

    if (remaining <= 0) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Fee is already fully paid for this student');
    }
    if (body.amountPaid > remaining) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Amount exceeds pending fee. Maximum payable: ${remaining}`,
      );
    }

    // 4. Generate receipt number
    const receiptNumber = await paymentRepository.generateReceiptNumber();

    // 5. Persist
    const payment = await paymentRepository.create({
      ...body,
      academicYear: fee.academicYear,
      receiptNumber,
      recordedBy:   userId,
    });

    await audit.log({
      userId,
      userEmail: '',
      module:      'payment',
      action:      'create',
      recordId:    payment._id,
      description: `Payment recorded — receipt: ${receiptNumber}, amount: ${body.amountPaid}`,
      metadata:    { receiptNumber, amountPaid: body.amountPaid, studentId: body.studentId },
    });

    return payment;
  },
};
