import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial stored auth
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();
    if (storedToken && storedUser) {
      setUser(storedUser);
      setToken(storedToken);
    } else {
      // In demo mode, if not explicitly logged out, keep demo logged in as default
      const defaultDemoUser = {
        id: 'usr-admin-01',
        name: 'Mrs. Sunita Rao',
        email: 'admin@greenwoodacademy.edu.in',
        role: 'Admin',
        title: 'Principal Admin',
        school: 'Greenwood Academy',
        academicYear: 'AY 2026–27',
      };
      const defaultToken = 'mock_jwt_token_demo';
      authService.login(defaultDemoUser.email, 'admin123').then((res) => {
        setUser(res.user);
        setToken(res.token);
      }).catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
