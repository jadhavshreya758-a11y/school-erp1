import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { name: 'Students', path: '/students', icon: 'school' },
  { name: 'Parents', path: '/parents', icon: 'family_restroom' },
  { name: 'Classes', path: '/classes', icon: 'meeting_room' },
  { name: 'Attendance', path: '/attendance', icon: 'event_available' },
  { name: 'Fees', path: '/fees', icon: 'receipt_long' },
  { name: 'Payments', path: '/payments', icon: 'payments' },
  { name: 'Reports', path: '/reports', icon: 'bar_chart' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Emblem */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <span className="font-headline font-bold text-lg text-primary tracking-tight">
                SchoolERP
              </span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={closeMobile}
              className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-outline px-3 mb-2">
              Academic Core
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Admin Profile & Logout */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-sm flex-shrink-0">
              SR
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-on-surface truncate">
                {user?.name || 'Mrs. Sunita Rao'}
              </span>
              <span className="text-xs text-outline truncate">
                {user?.title || 'Principal Admin'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
