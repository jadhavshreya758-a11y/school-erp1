import api from './api';
import { INITIAL_STUDENTS } from '../mock/mockData';

const STUDENTS_STORAGE_KEY = 'schoolerp_students_data';

const getStoredStudents = () => {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
};

const saveStudents = (students) => {
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
};

export const studentService = {
  /**
   * Get all students with optional query params (search, classId, status)
   * GET /api/students
   */
  async getStudents(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/students', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    let list = getStoredStudents();

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
          s.studentId?.toLowerCase().includes(q) ||
          s.parentPhone?.includes(q) ||
          s.parentName?.toLowerCase().includes(q)
      );
    }

    if (params.classId) {
      list = list.filter((s) => s.classId === params.classId || s.className?.toLowerCase().includes(params.classId.toLowerCase()));
    }

    if (params.status) {
      list = list.filter((s) => s.status.toLowerCase() === params.status.toLowerCase());
    }

    return list;
  },

  /**
   * Get student details by ID
   * GET /api/students/:id
   */
  async getStudentById(id) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get(`/students/${id}`);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredStudents();
    const student = list.find((s) => s.id === id || s.studentId === id);
    if (!student) {
      throw new Error(`Student with identifier ${id} not found.`);
    }
    return student;
  },

  /**
   * Create new student
   * POST /api/students
   */
  async createStudent(studentData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/students', studentData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 300));
    const list = getStoredStudents();

    // Check unique Student ID
    if (studentData.studentId && list.some((s) => s.studentId.toLowerCase() === studentData.studentId.toLowerCase())) {
      throw new Error(`Student ID ${studentData.studentId} is already in use. Please use a unique ID.`);
    }

    const newId = `stu-${Date.now().toString().slice(-4)}`;
    const studentId = studentData.studentId || `STU-2026-0${list.length + 1}`;

    const newStudent = {
      ...studentData,
      id: newId,
      studentId,
      status: studentData.status || 'Active',
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      totalFee: Number(studentData.totalFee) || 30000,
      paidFee: Number(studentData.paidFee) || 0,
      pendingFee: (Number(studentData.totalFee) || 30000) - (Number(studentData.paidFee) || 0),
      initials: `${studentData.firstName?.[0] || 'S'}${studentData.lastName?.[0] || 'T'}`.toUpperCase(),
    };

    const updated = [newStudent, ...list];
    saveStudents(updated);
    return newStudent;
  },

  /**
   * Update student
   * PUT /api/students/:id
   */
  async updateStudent(id, studentData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.put(`/students/${id}`, studentData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 250));
    const list = getStoredStudents();
    const index = list.findIndex((s) => s.id === id || s.studentId === id);
    if (index === -1) {
      throw new Error(`Student with identifier ${id} not found.`);
    }

    // Check unique Student ID if changed
    if (
      studentData.studentId &&
      studentData.studentId !== list[index].studentId &&
      list.some((s, idx) => idx !== index && s.studentId.toLowerCase() === studentData.studentId.toLowerCase())
    ) {
      throw new Error(`Student ID ${studentData.studentId} is already in use.`);
    }

    const updatedStudent = {
      ...list[index],
      ...studentData,
      pendingFee: (Number(studentData.totalFee ?? list[index].totalFee) || 0) - (Number(studentData.paidFee ?? list[index].paidFee) || 0),
    };

    list[index] = updatedStudent;
    saveStudents(list);
    return updatedStudent;
  },

  /**
   * Deactivate student
   * DELETE /api/students/:id or status update to 'Inactive'
   */
  async deactivateStudent(id) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.delete(`/students/${id}`);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const list = getStoredStudents();
    const index = list.findIndex((s) => s.id === id || s.studentId === id);
    if (index === -1) {
      throw new Error(`Student with identifier ${id} not found.`);
    }

    list[index].status = 'Inactive';
    saveStudents(list);
    return list[index];
  },

  /**
   * Reactivate student
   */
  async reactivateStudent(id) {
    const list = getStoredStudents();
    const index = list.findIndex((s) => s.id === id || s.studentId === id);
    if (index !== -1) {
      list[index].status = 'Active';
      saveStudents(list);
      return list[index];
    }
    throw new Error('Student not found');
  },
};

export default studentService;
