import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';
import { INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_CLASSES, INITIAL_PARENTS } from '../../mock/mockData';

export const Settings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: 'Greenwood Academy',
    academicYear: 'AY 2026–27',
    affiliationNumber: 'CBSE-AFF-2026-11409',
    principalName: 'Mrs. Sunita Rao',
    email: 'admin@greenwoodacademy.edu.in',
    phone: '+91 98765 43210',
    address: 'Plot 42, Sector 8, Kharadi, Pune, Maharashtra 411014',
    currency: '₹ (INR)',
    smsRemindersEnabled: true,
    autoAttendanceSync: true,
  });

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showToast('School institutional settings updated successfully.');
    } catch {
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo data (students, payments, attendance) to default initial state?')) {
      localStorage.setItem('schoolerp_students', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('schoolerp_payments', JSON.stringify(INITIAL_PAYMENTS));
      localStorage.setItem('schoolerp_classes', JSON.stringify(INITIAL_CLASSES));
      localStorage.setItem('schoolerp_parents', JSON.stringify(INITIAL_PARENTS));
      showToast('Demo data reset to original pristine state.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
          Institutional Settings
        </h1>
        <p className="text-xs text-outline mt-1">
          Configure school profile, academic calendar, administrative contacts, and communication triggers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
            <h2 className="text-sm font-bold font-headline text-on-surface">
              Greenwood Academy Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Official School Name *
              </label>
              <input
                type="text"
                required
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Current Academic Session *
              </label>
              <input
                type="text"
                required
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Board Affiliation / License Code
              </label>
              <input
                type="text"
                value={settings.affiliationNumber}
                onChange={(e) => setSettings({ ...settings, affiliationNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Principal / Head of Institution
              </label>
              <input
                type="text"
                value={settings.principalName}
                onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-[20px]">contact_mail</span>
            <h2 className="text-sm font-bold font-headline text-on-surface">
              Administrative Contact & Campus Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Administrative Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Official Helpline Contact
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-on-surface mb-1">
                Campus Postal Address
              </label>
              <textarea
                rows="2"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
        </div>

        {/* Preferences & Automations */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary border-b border-outline-variant/20 pb-3">
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <h2 className="text-sm font-bold font-headline text-on-surface">
              System Triggers & Currency
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsRemindersEnabled}
                onChange={(e) => setSettings({ ...settings, smsRemindersEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-secondary border-outline-variant"
              />
              <div>
                <span className="font-semibold text-on-surface block">
                  Automated Fee Overdue SMS Alerts
                </span>
                <span className="text-outline text-[11px]">
                  Send automated SMS notifications to guardians when fees remain unpaid past the due date.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAttendanceSync}
                onChange={(e) => setSettings({ ...settings, autoAttendanceSync: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-secondary border-outline-variant"
              />
              <div>
                <span className="font-semibold text-on-surface block">
                  Instant Daily Attendance Sync
                </span>
                <span className="text-outline text-[11px]">
                  Synchronize morning roll call audits directly into administrative dashboard metrics.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save & Danger Zone */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-4 py-2 border border-error/50 text-error hover:bg-error-container/30 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Reset Demo Data to Initial State
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-[#00174b] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Institutional Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
