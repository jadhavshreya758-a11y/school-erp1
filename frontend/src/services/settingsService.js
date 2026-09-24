import api from './api';
import { INITIAL_SCHOOL_SETTINGS } from '../mock/mockData';

const SETTINGS_STORAGE_KEY = 'schoolerp_settings_data';

const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(INITIAL_SCHOOL_SETTINGS));
      return INITIAL_SCHOOL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHOOL_SETTINGS;
  }
};

export const settingsService = {
  /**
   * Get School Settings
   * GET /api/settings
   */
  async getSettings() {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/settings');
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 150));
    return getStoredSettings();
  },

  /**
   * Update School Settings
   * PUT /api/settings
   */
  async updateSettings(data) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.put('/settings', data);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 250));
    const current = getStoredSettings();
    const updated = { ...current, ...data };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};

export default settingsService;
