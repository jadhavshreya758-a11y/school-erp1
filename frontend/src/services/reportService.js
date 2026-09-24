import api from './api';
import { INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_PAYMENTS, INITIAL_ATTENDANCE_ROSTER } from '../mock/mockData';

export const reportService = {
  /**
   * Get Student Summary Report
   * GET /api/reports/students
   */
  async getStudentReport() {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/reports/students');
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const rawStudents = localStorage.getItem('schoolerp_students_data');
    const students = rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS;

    const rawClasses = localStorage.getItem('schoolerp_classes_data');
    const classes = rawClasses ? JSON.parse(rawClasses) : INITIAL_CLASSES;

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'Active').length;
    const inactiveStudents = students.filter((s) => s.status === 'Inactive').length;

    const classDistribution = classes.map((c) => {
      const classStudents = students.filter((s) => s.classId === c.id || s.className?.includes(c.name));
      return {
        classId: c.id,
        className: `${c.name} - ${c.section}`,
        enrolled: classStudents.length,
        capacity: c.capacity,
        teacher: c.classTeacher,
        status: c.status,
      };
    });

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      classDistribution,
    };
  },

  /**
   * Get Attendance Report
   * GET /api/reports/attendance
   */
  async getAttendanceReport(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/reports/attendance', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const rawRoster = localStorage.getItem('schoolerp_attendance_roster_data');
    const roster = rawRoster ? JSON.parse(rawRoster) : INITIAL_ATTENDANCE_ROSTER;

    const total = roster.length;
    const present = roster.filter((r) => r.status === 'Present').length;
    const absent = roster.filter((r) => r.status === 'Absent').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return {
      date: params.date || '2026-09-22',
      total,
      present,
      absent,
      rate,
      classBreakdown: [
        { className: 'Nursery A', enrolled: 24, present: 22, absent: 2, rate: '91.6%' },
        { className: 'Junior KG A', enrolled: 22, present: 20, absent: 2, rate: '90.9%' },
        { className: 'Senior KG A', enrolled: 25, present: 24, absent: 1, rate: '96.0%' },
        { className: 'Class 1', enrolled: 27, present: 25, absent: 2, rate: '92.5%' },
        { className: 'Class 2', enrolled: 30, present: 24, absent: 6, rate: '80.0%' },
      ],
    };
  },

  /**
   * Get Fee Report
   * GET /api/reports/fees
   */
  async getFeeReport() {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/reports/fees');
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const rawStudents = localStorage.getItem('schoolerp_students_data');
    const students = rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS;

    const rawPayments = localStorage.getItem('schoolerp_payments_data');
    const payments = rawPayments ? JSON.parse(rawPayments) : INITIAL_PAYMENTS;

    const totalFees = students.reduce((sum, s) => sum + (s.totalFee || 0), 0);
    const totalCollected = students.reduce((sum, s) => sum + (s.paidFee || 0), 0);
    const totalPending = students.reduce((sum, s) => sum + (s.pendingFee || 0), 0);
    const realizationRate = totalFees > 0 ? ((totalCollected / totalFees) * 100).toFixed(1) : 0;

    return {
      totalFees,
      totalCollected,
      totalPending,
      realizationRate,
      recentReceiptsCount: payments.length,
      studentsPendingCount: students.filter((s) => s.pendingFee > 0).length,
    };
  },
};

export default reportService;
