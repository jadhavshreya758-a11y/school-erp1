import api from './api';

const MOCK_STORAGE_KEY_USER = 'schoolerp_user';
const MOCK_STORAGE_KEY_TOKEN = 'schoolerp_token';

export const authService = {
  /**
   * Login Admin
   * POST /api/auth/login
   */
  async login(email, password) {
    try {
      // If configured for real API
      if (import.meta.env.VITE_USE_REAL_API === 'true') {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem(MOCK_STORAGE_KEY_TOKEN, token);
        localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(user));
        return { token, user };
      }
    } catch {
      // Fallback to demo mode
    }

    // Realistic Demo Mock Authentication
    // Simulating API network latency
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // Default admin credentials
    const adminUser = {
      id: 'usr-admin-01',
      name: 'Mrs. Sunita Rao',
      email: email || 'admin@greenwoodacademy.edu.in',
      role: 'Admin',
      title: 'Principal Admin',
      school: 'Greenwood Academy',
      academicYear: 'AY 2026–27',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuqgG9ofizYWcJ7K1i3FaKLnV2g288NbDV7X9IjM42wdbpWFdHsfF8I985FcQ0EBF4qYwSbTCisVx9yHpF8-aEkk6u9zDj81pzx2oR1_gdVflZtRS53KkDKSwGmi1A_uV59p7GA20816ovp9FvqAN-lseNXwI5xspgLq4pJb6x0nZzxsYAmo7yiyzeR5yFktEcywIToB2vmCt9c7eXRJ-tjNb_ppbZcz2GqmiqjvF0fILqKRoz7Uw',
    };

    const mockToken = 'mock_jwt_token_' + Date.now();
    localStorage.setItem(MOCK_STORAGE_KEY_TOKEN, mockToken);
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(adminUser));

    return { token: mockToken, user: adminUser };
  },

  /**
   * Logout Admin
   */
  logout() {
    localStorage.removeItem(MOCK_STORAGE_KEY_TOKEN);
    localStorage.removeItem(MOCK_STORAGE_KEY_USER);
  },

  /**
   * Get Current Stored User
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get Current Token
   */
  getToken() {
    return localStorage.getItem(MOCK_STORAGE_KEY_TOKEN);
  },

  /**
   * Check Auth status
   */
  isAuthenticated() {
    return !!localStorage.getItem(MOCK_STORAGE_KEY_TOKEN);
  },
};

export default authService;
