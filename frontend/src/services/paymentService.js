import api from './api';
import { INITIAL_PAYMENTS, INITIAL_STUDENTS } from '../mock/mockData';

const PAYMENTS_STORAGE_KEY = 'schoolerp_payments_data';

const getStoredPayments = () => {
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
};

const savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
};

export const paymentService = {
  /**
   * Get payments with filters
   * GET /api/payments
   */
  async getPayments(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/payments', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    let list = getStoredPayments();

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.receiptNo.toLowerCase().includes(q) ||
          p.referenceId?.toLowerCase().includes(q)
      );
    }

    if (params.mode && params.mode !== 'All') {
      list = list.filter((p) => p.mode.toLowerCase() === params.mode.toLowerCase());
    }

    if (params.studentId) {
      list = list.filter((p) => p.studentId === params.studentId || p.studentNumber === params.studentId);
    }

    return list;
  },

  /**
   * Record new payment
   * POST /api/payments
   */
  async createPayment(paymentData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/payments', paymentData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 350));
    const amount = Number(paymentData.amount);

    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid positive payment amount.');
    }

    // Read and update student records
    const rawStudents = localStorage.getItem('schoolerp_students_data');
    const students = rawStudents ? JSON.parse(rawStudents) : [...INITIAL_STUDENTS];
    const sIndex = students.findIndex((s) => s.id === paymentData.studentId || s.studentId === paymentData.studentId);

    if (sIndex === -1) {
      throw new Error('Selected student not found in roster.');
    }

    const targetStudent = students[sIndex];

    // Business rule: Amount cannot exceed current pending fee
    if (amount > targetStudent.pendingFee) {
      throw new Error(
        `Payment amount (₹${amount.toLocaleString('en-IN')}) exceeds student's current pending dues (₹${targetStudent.pendingFee.toLocaleString('en-IN')}). Overpayment is prohibited.`
      );
    }

    // Update Student Ledger
    const newPaid = targetStudent.paidFee + amount;
    const newPending = targetStudent.totalFee - newPaid;
    students[sIndex] = {
      ...targetStudent,
      paidFee: newPaid,
      pendingFee: newPending,
    };
    localStorage.setItem('schoolerp_students_data', JSON.stringify(students));

    // Generate Receipt Record
    const list = getStoredPayments();
    const receiptNo = paymentData.receiptNo || `REC-2026-${String(list.length + 90).padStart(3, '0')}`;

    const newPayment = {
      id: `pay-${Date.now().toString().slice(-4)}`,
      receiptNo,
      studentId: targetStudent.id,
      studentNumber: targetStudent.studentId,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      className: targetStudent.className,
      amount,
      date: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      mode: paymentData.paymentMode || 'UPI',
      referenceId: paymentData.referenceId || `${paymentData.paymentMode || 'UPI'}-${Date.now().toString().slice(-6)}`,
      status: 'Paid',
      remarks: paymentData.remarks || 'Tuition installment',
    };

    savePayments([newPayment, ...list]);
    return {
      payment: newPayment,
      updatedStudent: students[sIndex],
    };
  },
};

export default paymentService;
