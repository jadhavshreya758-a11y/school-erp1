import api from './api';
import { INITIAL_PARENTS } from '../mock/mockData';

const PARENTS_STORAGE_KEY = 'schoolerp_parents_data';

const getStoredParents = () => {
  try {
    const raw = localStorage.getItem(PARENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(INITIAL_PARENTS));
      return INITIAL_PARENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARENTS;
  }
};

const saveParents = (parents) => {
  localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(parents));
};

export const parentService = {
  /**
   * Get all parents
   * GET /api/parents
   */
  async getParents(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/parents', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    let list = getStoredParents();

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Get parent by ID
   * GET /api/parents/:id
   */
  async getParentById(id) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get(`/parents/${id}`);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    const list = getStoredParents();
    const parent = list.find((p) => p.id === id);
    if (!parent) {
      throw new Error(`Parent with ID ${id} not found.`);
    }
    return parent;
  },

  /**
   * Create new parent
   * POST /api/parents
   */
  async createParent(parentData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/parents', parentData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 250));
    const list = getStoredParents();
    const newParent = {
      ...parentData,
      id: `par-${Date.now().toString().slice(-4)}`,
      studentIds: parentData.studentIds || [],
      relation: parentData.relation || 'Parent (Primary)',
    };

    const updated = [newParent, ...list];
    saveParents(updated);
    return newParent;
  },

  /**
   * Update parent
   * PUT /api/parents/:id
   */
  async updateParent(id, parentData) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.put(`/parents/${id}`, parentData);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    const list = getStoredParents();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Parent with ID ${id} not found.`);
    }

    list[index] = { ...list[index], ...parentData };
    saveParents(list);
    return list[index];
  },
};

export default parentService;
