import api from './api';
import { INITIAL_CLASSES } from '../mock/mockData';

const CLASSES_STORAGE_KEY = 'schoolerp_classes_data';

const getStoredClasses = () => {
  try {
    const raw = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CLASSES;
  }
};

const saveClasses = (classes) => {
  localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
};

export const classService = {
  /**
   * Get all classes
   * GET /api/classes
   */
  async getClasses(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/classes', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 180));
    let list = getStoredClasses();

    if (params.status) {
      list = list.filter((c) => c.status.toLowerCase() === params.status.toLowerCase());
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q) ||
          c.classTeacher?.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Get class by ID
   * GET /api/classes/:id
   */
  async getClassById(id) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get(`/classes/${id}`);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredClasses();
    const found = list.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Class with ID ${id} not found.`);
    }
    return found;
  },

  /**
   * Create new class
   * POST /api/classes
   */
  async createClass(classData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/classes', classData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 250));
    const list = getStoredClasses();

    // Check duplicate class + section
    if (
      list.some(
        (c) =>
          c.name.toLowerCase() === classData.name.toLowerCase() &&
          c.section.toLowerCase() === classData.section.toLowerCase() &&
          c.academicYear === (classData.academicYear || 'AY 2026–27')
      )
    ) {
      throw new Error(`A class for ${classData.name} - Section ${classData.section} already exists for this academic year.`);
    }

    const newClass = {
      ...classData,
      id: `cls-${Date.now().toString().slice(-4)}`,
      academicYear: classData.academicYear || 'AY 2026–27',
      enrolled: Number(classData.enrolled) || 0,
      capacity: Number(classData.capacity) || 25,
      annualFee: Number(classData.annualFee) || 30000,
      status: classData.status || 'Active',
    };

    const updated = [...list, newClass];
    saveClasses(updated);
    return newClass;
  },

  /**
   * Update class
   * PUT /api/classes/:id
   */
  async updateClass(id, classData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.put(`/classes/${id}`, classData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const list = getStoredClasses();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Class with ID ${id} not found.`);
    }

    list[index] = { ...list[index], ...classData };
    saveClasses(list);
    return list[index];
  },

  /**
   * Deactivate class
   */
  async deactivateClass(id) {
    const list = getStoredClasses();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Class with ID ${id} not found.`);
    }

    list[index].status = 'Inactive';
    saveClasses(list);
    return list[index];
  },
};

export default classService;
