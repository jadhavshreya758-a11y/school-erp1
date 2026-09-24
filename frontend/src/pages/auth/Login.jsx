import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@greenwoodacademy.edu.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      showToast('Welcome back, Mrs. Sunita Rao!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('admin@greenwoodacademy.edu.in');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      {/* Background Decorative Accents */}
      <div className="w-full max-w-md">
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-lg mb-3">
            <span className="material-symbols-outlined text-[32px]">school</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-primary tracking-tight">
            SchoolERP
          </h1>
          <p className="text-xs text-outline mt-1">
            Greenwood Academy • Academic Administration Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-xl border border-outline-variant/30">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-headline text-on-surface">Administrator Login</h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Sign in with your authorized school administrator credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@greenwoodacademy.edu.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-on-surface">
                  Password
                </label>
                <span className="text-[11px] text-secondary font-medium">
                  AY 2026–27
                </span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-xs shadow-md hover:bg-[#00174b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Demo helper */}
          <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDemoCredentials}
              className="w-full py-1.5 px-3 rounded-lg border border-secondary text-secondary text-xs font-semibold hover:bg-secondary-fixed/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Fill Default Demo Credentials</span>
            </button>
            <p className="text-[11px] text-center text-outline">
              Role: Principal Admin (Mrs. Sunita Rao)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
