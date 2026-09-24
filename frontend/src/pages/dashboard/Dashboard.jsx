import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { studentService } from '../../services/studentService';
import { feeService } from '../../services/feeService';
import { paymentService } from '../../services/paymentService';
import { attendanceService } from '../../services/attendanceService';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 128,
    activeCohorts: 8,
    feesCollected: 384500,
    pendingFees: 72500,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingDuesList, setPendingDuesList] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    rate: '89.8%',
    present: 115,
    absent: 13,
    classes: [
      { name: 'Senior KG - A', rate: '96.0%', present: 24, total: 25 },
      { name: 'Class 1 - A', rate: '92.5%', present: 25, total: 27 },
      { name: 'Junior KG - A', rate: '90.9%', present: 20, total: 22 },
      { name: 'Class 2 - A', rate: '80.0%', present: 24, total: 30 },
    ],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [students, feesData, payments] = await Promise.all([
          studentService.getStudents(),
          feeService.getPendingFees(),
          paymentService.getPayments(),
        ]);

        const totalEnrolled = students.length;
        const totalColl = students.reduce((sum, s) => sum + (s.paidFee || 0), 0);
        const totalPend = students.reduce((sum, s) => sum + (s.pendingFee || 0), 0);

        setStats({
          totalStudents: totalEnrolled || 128,
          activeCohorts: 8,
          feesCollected: totalColl || 384500,
          pendingFees: totalPend || 72500,
        });

        setRecentPayments(payments.slice(0, 5));
        setPendingDuesList(feesData.pendingList.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
              Good Morning, Sunita
            </h1>
            <span className="material-symbols-outlined text-[20px] text-amber-500">wb_sunny</span>
          </div>
          <p className="text-xs text-outline mt-1">
            Here's what's happening at <span className="font-semibold text-on-surface">Greenwood Academy</span> today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/students?action=add')}
            className="flex items-center gap-2 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">event_available</span>
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate('/fees?tab=collect')}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low text-on-surface rounded-xl text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Collect Fee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Students"
          value={stats.totalStudents}
          icon="school"
          badgeText="+6 this month"
          badgeType="positive"
          subtext="across 8 cohorts"
          accentBarColor="bg-primary"
          onClick={() => navigate('/students')}
        />
        <KpiCard
          label="Active Cohorts"
          value={stats.activeCohorts}
          icon="meeting_room"
          badgeText="AY 2026–27"
          badgeType="warning"
          subtext="100% capacity in 3"
          accentBarColor="bg-secondary"
          onClick={() => navigate('/classes')}
        />
        <KpiCard
          label="Fees Collected"
          value={`₹${stats.feesCollected.toLocaleString('en-IN')}`}
          icon="account_balance_wallet"
          badgeText="84.2% realized"
          badgeType="positive"
          subtext="vs target ₹4.56L"
          accentBarColor="bg-[#166534]"
          onClick={() => navigate('/fees')}
        />
        <KpiCard
          label="Pending Fees"
          value={`₹${stats.pendingFees.toLocaleString('en-IN')}`}
          icon="pending_actions"
          badgeText="14 Overdue"
          badgeType="error"
          subtext="across 11 accounts"
          accentBarColor="bg-error"
          onClick={() => navigate('/fees?tab=pending')}
        />
      </div>

      {/* Main Grid: Left (Attendance + Payments) & Right (Pending Dues + Memo) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Overview */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">event_available</span>
                <h2 className="text-sm font-bold font-headline text-on-surface">Today's Attendance</h2>
              </div>
              <button
                onClick={() => navigate('/attendance')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>Full Roll Call</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Attendance Metric Bar */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-on-surface">Overall Rate: {attendanceSummary.rate}</span>
                <span className="text-outline">
                  <span className="text-[#166534] font-semibold">{attendanceSummary.present} Present</span> ·{' '}
                  <span className="text-error font-semibold">{attendanceSummary.absent} Absent</span>
                </span>
              </div>
              {/* Dual-color progress bar */}
              <div className="w-full h-3 bg-[#ffdad6] rounded-full overflow-hidden flex">
                <div className="bg-[#166534] h-full" style={{ width: attendanceSummary.rate }} />
              </div>
            </div>

            {/* Class Breakdown Mini Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {attendanceSummary.classes.map((cls) => (
                <div key={cls.name} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="text-xs font-semibold text-on-surface truncate">{cls.name}</div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-lg font-bold font-headline text-on-surface tabular-nums">
                      {cls.rate}
                    </span>
                    <span className="text-[11px] text-outline">
                      {cls.present}/{cls.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments Table */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">receipt</span>
                <h2 className="text-sm font-bold font-headline text-on-surface">Recent Fee Receipts</h2>
              </div>
              <button
                onClick={() => navigate('/payments')}
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>View All Receipts</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-outline text-[11px] uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Receipt No.</th>
                    <th className="pb-2.5 font-semibold">Student</th>
                    <th className="pb-2.5 font-semibold">Class</th>
                    <th className="pb-2.5 font-semibold text-right">Amount</th>
                    <th className="pb-2.5 font-semibold">Mode</th>
                    <th className="pb-2.5 font-semibold">Date</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {recentPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 font-mono font-medium text-primary">{pay.receiptNo}</td>
                      <td className="py-3 font-medium text-on-surface">{pay.studentName}</td>
                      <td className="py-3 text-on-surface-variant">{pay.className}</td>
                      <td className="py-3 text-right font-mono font-bold text-on-surface tabular-nums">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-medium">
                          {pay.mode}
                        </span>
                      </td>
                      <td className="py-3 text-outline font-mono text-[11px]">{pay.date}</td>
                      <td className="py-3">
                        <StatusBadge status="Paid" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-6">
          {/* Pending Tuition Dues List */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold font-headline text-on-surface">Pending Tuition Dues</h2>
                <p className="text-[11px] text-outline">Actionable outstanding fees</p>
              </div>
              <span className="text-[11px] font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                14 accounts
              </span>
            </div>

            <div className="divide-y divide-outline-variant/10">
              {pendingDuesList.map((item) => (
                <div key={item.studentId} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-on-surface truncate">{item.studentName}</p>
                      <p className="text-[11px] text-outline truncate">{item.className}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold font-mono text-error tabular-nums">
                      ₹{item.pendingBalance.toLocaleString('en-IN')}
                    </p>
                    <button
                      onClick={() => navigate(`/fees?tab=collect&studentId=${item.studentId}`)}
                      className="mt-1 px-2.5 py-1 bg-secondary text-white rounded-lg text-[11px] font-semibold hover:bg-[#003ea8] transition-colors"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/fees?tab=pending')}
              className="w-full py-2 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold rounded-xl border border-outline-variant/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View All 14 Pending Accounts</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Administrative Memo */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              <h3 className="text-xs font-bold font-headline uppercase tracking-wider">Administrative Memo</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary-fixed/30 border border-secondary-fixed space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-secondary-fixed">Term 1 Fee Deadline</span>
                <span className="text-[10px] text-on-secondary-fixed-variant font-mono">30 Sep 2026</span>
              </div>
              <p className="text-[11px] text-on-secondary-fixed-variant leading-relaxed">
                Parents with pending installments will receive SMS reminders on Friday morning. Please reconcile cash receipts by 4:00 PM daily.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Staff Academic Review</span>
                <span className="text-[10px] text-outline font-mono">Friday 3:30 PM</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Monthly attendance registers review and syllabus completion review in Conference Hall.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
