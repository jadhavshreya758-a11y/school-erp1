import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Students from '../pages/students/Students';
import Attendance from '../pages/attendance/Attendance';
import Fees from '../pages/fees/Fees';
import PaymentHistory from '../pages/payments/PaymentHistory';
import Classes from '../pages/classes/Classes';
import Parents from '../pages/parents/Parents';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
