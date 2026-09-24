import api from './api';
import { INITIAL_CLASSES, INITIAL_STUDENTS } from '../mock/mockData';

const FEE_STRUCTURE_KEY = 'schoolerp_fee_structures_data';

const getStoredFeeStructures = () => {
  try {
    const raw = localStorage.getItem(FEE_STRUCTURE_KEY);
    if (!raw) {
      const initial = INITIAL_CLASSES.map((c) => ({
        id: `fee-str-${c.id}`,
        classId: c.id,
        className: `${c.name} - ${c.section}`,
        academicYear: c.academicYear,
        annualFee: c.annualFee,
        status: c.status,
      }));
      localStorage.setItem(FEE_STRUCTURE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveFeeStructures = (list) => {
  localStorage.setItem(FEE_STRUCTURE_KEY, JSON.stringify(list));
};

export const feeService = {
  /**
   * Get all Fee Structures
   * GET /api/fees
   */
  async getFeeStructures() {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/fees');
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 180));
    return getStoredFeeStructures();
  },

  /**
   * Create or update fee structure
   * POST /api/fees
   */
  async createFeeStructure(data) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/fees', data);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 250));
    const list = getStoredFeeStructures();
    const newStructure = {
      ...data,
      id: `fee-str-${Date.now().toString().slice(-4)}`,
      annualFee: Number(data.annualFee) || 30000,
      status: data.status || 'Active',
      academicYear: data.academicYear || 'AY 2026–27',
    };

    const updated = [...list, newStructure];
    saveFeeStructures(updated);
    return newStructure;
  },

  /**
   * Update fee structure
   * PUT /api/fees/:id
   */
  async updateFeeStructure(id, data) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.put(`/fees/${id}`, data);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const list = getStoredFeeStructures();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) {
      throw new Error('Fee structure not found.');
    }

    list[idx] = { ...list[idx], ...data, annualFee: Number(data.annualFee) || list[idx].annualFee };
    saveFeeStructures(list);
    return list[idx];
  },

  /**
   * Get Pending Fees Summary and Students List
   */
  async getPendingFees(params = {}) {
    await new Promise((res) => setTimeout(res, 200));
    const rawStudents = localStorage.getItem('schoolerp_students_data');
    const students = rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS;

    let pendingList = students
      .filter((s) => s.status === 'Active' && s.pendingFee > 0)
      .map((s) => ({
        studentId: s.id,
        studentNumber: s.studentId,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        classId: s.classId,
        annualFee: s.totalFee,
        paidToDate: s.paidFee,
        pendingBalance: s.pendingFee,
        guardianName: s.parentName,
        guardianPhone: s.parentPhone,
        initials: s.initials || `${s.firstName[0]}${s.lastName[0]}`,
        photoUrl: s.photoUrl,
      }));

    if (params.search) {
      const q = params.search.toLowerCase();
      pendingList = pendingList.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.studentNumber.toLowerCase().includes(q) ||
          p.guardianPhone?.includes(q)
      );
    }

    if (params.className && params.className !== 'All') {
      pendingList = pendingList.filter((p) => p.className.toLowerCase().includes(params.className.toLowerCase()));
    }

    const totalTarget = students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
    const totalCollected = students.reduce((acc, s) => acc + (s.paidFee || 0), 0);
    const totalPending = students.reduce((acc, s) => acc + (s.pendingFee || 0), 0);

    return {
      pendingList,
      totalCount: pendingList.length,
      totalPendingAmount: totalPending,
      totalCollectedAmount: totalCollected,
      annualTargetAmount: totalTarget,
    };
  },
};

export default feeService;
