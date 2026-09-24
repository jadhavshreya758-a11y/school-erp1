import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const Reports = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('fees');
  const [loading, setLoading] = useState(true);

  const [studentReport, setStudentReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [feeReport, setFeeReport] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [stu, att, fee] = await Promise.all([
        reportService.getStudentReport(),
        reportService.getAttendanceReport(),
        reportService.getFeeReport(),
      ]);
      setStudentReport(stu);
      setAttendanceReport(att);
      setFeeReport(fee);
    } catch {
      showToast('Failed to load analytical reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handlePrint = () => {
    showToast('Report generated for export/print view.');
    window.print();
  };

  if (loading) {
    return <LoadingState message="Synthesizing academic reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-outline mt-1">
            Auditable summaries across student enrollment, attendance rates, and fee realization.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/30 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Fee Realization Report</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span>Student Enrollment Report</span>
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">event_available</span>
          <span>Daily Attendance Audit</span>
        </button>
      </div>

      {/* Tab 1: Fee Realization Report */}
      {activeTab === 'fees' && feeReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Annual Target"
              value={`₹${feeReport.totalFees.toLocaleString('en-IN')}`}
              icon="flag"
              accentBarColor="bg-primary"
            />
            <KpiCard
              label="Total Realized"
              value={`₹${feeReport.totalCollected.toLocaleString('en-IN')}`}
              icon="verified"
              accentBarColor="bg-[#166534]"
            />
            <KpiCard
              label="Total Pending"
              value={`₹${feeReport.totalPending.toLocaleString('en-IN')}`}
              icon="error"
              accentBarColor="bg-error"
            />
            <KpiCard
              label="Realization Rate"
              value={`${feeReport.realizationRate}%`}
              icon="percent"
              accentBarColor="bg-secondary"
            />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold font-headline text-on-surface">
              Fee Collection Summary (Greenwood Academy AY 2026–27)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
                <span className="text-outline text-xs">Total Issued Receipts</span>
                <p className="font-headline font-bold text-2xl text-on-surface tabular-nums">
                  {feeReport.recentReceiptsCount}
                </p>
                <p className="text-[11px] text-outline">Reconciled in primary account</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
                <span className="text-outline text-xs">Students with Pending Dues</span>
                <p className="font-headline font-bold text-2xl text-error tabular-nums">
                  {feeReport.studentsPendingCount}
                </p>
                <p className="text-[11px] text-outline">Reminders queued for dispatch</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
                <span className="text-outline text-xs">Overall Efficiency</span>
                <p className="font-headline font-bold text-2xl text-[#166534] tabular-nums">
                  {feeReport.realizationRate}%
                </p>
                <p className="text-[11px] text-outline">Exceeds minimum benchmark (75%)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Enrollment Report */}
      {activeTab === 'students' && studentReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              label="Total Enrolled"
              value={studentReport.totalStudents}
              icon="groups"
              accentBarColor="bg-primary"
            />
            <KpiCard
              label="Active Students"
              value={studentReport.activeStudents}
              icon="check_circle"
              accentBarColor="bg-[#166534]"
            />
            <KpiCard
              label="Inactive Records"
              value={studentReport.inactiveStudents}
              icon="person_off"
              accentBarColor="bg-error"
            />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20">
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Cohort Enrollment & Capacity Matrix
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Cohort</th>
                    <th className="py-3 px-4 font-semibold">Class Teacher</th>
                    <th className="py-3 px-4 font-semibold text-center">Enrolled</th>
                    <th className="py-3 px-4 font-semibold text-center">Capacity</th>
                    <th className="py-3 px-4 font-semibold text-center">Utilization</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {studentReport.classDistribution.map((item) => {
                    const pct = item.capacity > 0 ? Math.round((item.enrolled / item.capacity) * 100) : 0;
                    return (
                      <tr key={item.classId} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-4 font-bold text-on-surface">{item.className}</td>
                        <td className="py-3 px-4 text-on-surface">{item.teacher}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-primary tabular-nums">
                          {item.enrolled}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-outline tabular-nums">
                          {item.capacity}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold tabular-nums">
                          {pct}%
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Attendance Audit */}
      {activeTab === 'attendance' && attendanceReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Audited Students"
              value={attendanceReport.total}
              icon="groups"
              accentBarColor="bg-primary"
            />
            <KpiCard
              label="Present Today"
              value={attendanceReport.present}
              icon="check_circle"
              accentBarColor="bg-[#166534]"
            />
            <KpiCard
              label="Absent Today"
              value={attendanceReport.absent}
              icon="cancel"
              accentBarColor="bg-error"
            />
            <KpiCard
              label="Attendance Rate"
              value={`${attendanceReport.rate}%`}
              icon="percent"
              accentBarColor="bg-secondary"
            />
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20">
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Class Attendance Rates breakdown ({attendanceReport.date})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Cohort</th>
                    <th className="py-3 px-4 font-semibold text-center">Enrolled</th>
                    <th className="py-3 px-4 font-semibold text-center text-[#166534]">Present</th>
                    <th className="py-3 px-4 font-semibold text-center text-error">Absent</th>
                    <th className="py-3 px-4 font-semibold text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {attendanceReport.classBreakdown.map((b) => (
                    <tr key={b.className} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-bold text-on-surface">{b.className}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">{b.enrolled}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#166534] tabular-nums">{b.present}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-error tabular-nums">{b.absent}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-primary text-sm tabular-nums">
                        {b.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
