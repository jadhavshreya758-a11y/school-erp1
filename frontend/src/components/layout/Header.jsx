import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-30 flex items-center justify-between px-4 lg:px-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Toggle & School Badges */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40">
            <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
            <span className="text-xs text-on-surface font-semibold truncate max-w-[140px] sm:max-w-none">
              Greenwood Academy
            </span>
          </div>
          <div className="hidden sm:flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
            AY 2026–27
          </div>
        </div>
      </div>

      {/* Right: Quick Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <form onSubmit={handleSearch} className="relative hidden md:flex items-center w-64">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search students..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low text-on-surface text-xs placeholder:text-outline focus:outline-none focus:border-secondary transition-colors"
          />
        </form>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            title="School Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 pb-2 border-b border-outline-variant/20 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-outline">Notifications</span>
                <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-semibold">2 New</span>
              </div>
              <div className="divide-y divide-outline-variant/10 text-xs">
                <div className="p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="font-semibold text-on-surface">Term 1 Fee Submission Due</div>
                  <div className="text-outline text-[11px] mt-0.5">30 Sep 2026 deadline approaching for 23 students.</div>
                </div>
                <div className="p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="font-semibold text-on-surface">Attendance Review Ready</div>
                  <div className="text-outline text-[11px] mt-0.5">Morning session audit verified (89.8% present).</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuqgG9ofizYWcJ7K1i3FaKLnV2g288NbDV7X9IjM42wdbpWFdHsfF8I985FcQ0EBF4qYwSbTCisVx9yHpF8-aEkk6u9zDj81pzx2oR1_gdVflZtRS53KkDKSwGmi1A_uV59p7GA20816ovp9FvqAN-lseNXwI5xspgLq4pJb6x0nZzxsYAmo7yiyzeR5yFktEcywIToB2vmCt9c7eXRJ-tjNb_ppbZcz2GqmiqjvF0fILqKRoz7Uw"
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/50"
            />
            <span className="hidden md:inline text-xs font-semibold text-on-surface">
              {user?.name || 'Mrs. Sunita Rao'}
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_more</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">{user?.name || 'Mrs. Sunita Rao'}</p>
                <p className="text-[11px] text-outline truncate">{user?.email || 'admin@greenwoodacademy.edu.in'}</p>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>School Settings</span>
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-error hover:bg-error-container/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
