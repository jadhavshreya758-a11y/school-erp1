import api from './api';
import { INITIAL_ATTENDANCE_ROSTER, INITIAL_ATTENDANCE_HISTORY } from '../mock/mockData';

const ATTENDANCE_ROSTER_KEY = 'schoolerp_attendance_roster_data';
const ATTENDANCE_HISTORY_KEY = 'schoolerp_attendance_history_data';

const getStoredRoster = () => {
  try {
    const raw = localStorage.getItem(ATTENDANCE_ROSTER_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_ROSTER_KEY, JSON.stringify(INITIAL_ATTENDANCE_ROSTER));
      return INITIAL_ATTENDANCE_ROSTER;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ATTENDANCE_ROSTER;
  }
};

const getStoredHistory = () => {
  try {
    const raw = localStorage.getItem(ATTENDANCE_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_HISTORY_KEY, JSON.stringify(INITIAL_ATTENDANCE_HISTORY));
      return INITIAL_ATTENDANCE_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ATTENDANCE_HISTORY;
  }
};

const saveRoster = (roster) => {
  localStorage.setItem(ATTENDANCE_ROSTER_KEY, JSON.stringify(roster));
};

const saveHistory = (history) => {
  localStorage.setItem(ATTENDANCE_HISTORY_KEY, JSON.stringify(history));
};

export const attendanceService = {
  /**
   * Get attendance for given class & date
   * GET /api/attendance
   */
  async getAttendance(params = {}) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.get('/attendance', { params });
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 200));
    let roster = getStoredRoster();

    if (params.search) {
      const q = params.search.toLowerCase();
      roster = roster.filter(
        (item) =>
          item.studentName.toLowerCase().includes(q) ||
          item.studentNumber.toLowerCase().includes(q) ||
          item.rollNumber.includes(q)
      );
    }

    return roster;
  },

  /**
   * Save roll-call attendance sheet for a class & date
   * POST /api/attendance
   */
  async markAttendance(payload) {
    if (import.meta.env.VITE_USE_REAL_API === 'true') {
      try {
        const res = await api.post('/attendance', payload);
        return res.data;
      } catch (err) {
        console.warn('Real API failed, fallback to mock store:', err);
      }
    }

    await new Promise((res) => setTimeout(res, 350));
    const { date, className, records } = payload;

    // Update current active roster
    saveRoster(records);

    // Update history without duplicates for same student + date
    const history = getStoredHistory();
    const filteredHistory = history.filter((h) => !(h.date === date && h.className === className));

    const newHistoryRecords = records.map((r, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      date,
      className,
      studentName: r.studentName,
      studentNumber: r.studentNumber,
      status: r.status,
      remarks: r.remarks || '',
    }));

    const updatedHistory = [...newHistoryRecords, ...filteredHistory];
    saveHistory(updatedHistory);

    return {
      success: true,
      date,
      className,
      presentCount: records.filter((r) => r.status === 'Present').length,
      absentCount: records.filter((r) => r.status === 'Absent').length,
      totalCount: records.length,
    };
  },

  /**
   * Get historical attendance logs
   */
  async getAttendanceHistory(params = {}) {
    await new Promise((res) => setTimeout(res, 200));
    let history = getStoredHistory();

    if (params.date) {
      history = history.filter((h) => h.date === params.date);
    }
    if (params.className) {
      history = history.filter((h) => h.className.toLowerCase().includes(params.className.toLowerCase()));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      history = history.filter((h) => h.studentName.toLowerCase().includes(q));
    }

    return history;
  },
};

export default attendanceService;
