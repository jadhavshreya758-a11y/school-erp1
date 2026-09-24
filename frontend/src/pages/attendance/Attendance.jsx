import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { KpiCard } from '../../components/common/KpiCard';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const Attendance = () => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('cls-jkg-a');
  const [selectedDate, setSelectedDate] = useState('2026-09-22');
  const [searchQuery, setSearchQuery] = useState('');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    classService.getClasses({ status: 'Active' }).then((clsList) => {
      setClasses(clsList);
      if (clsList.length > 0 && !selectedClass) {
        setSelectedClass(clsList[0].id);
      }
    });
  }, []);

  const loadAttendanceRoster = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendance({
        classId: selectedClass,
        date: selectedDate,
      });
      setRoster(data);
      setHasChanges(false);
    } catch {
      showToast('Failed to load attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    const hist = await attendanceService.getAttendanceHistory();
    setHistoryList(hist);
  };

  useEffect(() => {
    if (viewHistory) {
      loadHistory();
    } else {
      loadAttendanceRoster();
    }
  }, [selectedClass, selectedDate, viewHistory]);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...roster];
    updated[index].status = newStatus;
    setRoster(updated);
    setHasChanges(true);
  };

  const handleRemarksChange = (index, value) => {
    const updated = [...roster];
    updated[index].remarks = value;
    setRoster(updated);
    setHasChanges(true);
  };

  const handleMarkAllPresent = () => {
    const updated = roster.map((r) => ({ ...r, status: 'Present' }));
    setRoster(updated);
    setHasChanges(true);
    showToast('Marked all students as Present.');
  };

  const handleResetStatus = () => {
    loadAttendanceRoster();
    showToast('Reset attendance status to saved state.', 'info');
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    const selectedClassName = classes.find((c) => c.id === selectedClass)
      ? `${classes.find((c) => c.id === selectedClass).name} - ${classes.find((c) => c.id === selectedClass).section}`
      : 'Junior KG - A';

    try {
      const res = await attendanceService.markAttendance({
        classId: selectedClass,
        className: selectedClassName,
        date: selectedDate,
        records: roster,
      });

      setHasChanges(false);
      showToast(
        `Attendance for ${selectedClassName} (${selectedDate}) saved: ${res.presentCount} Present, ${res.absentCount} Absent.`
      );
    } catch (err) {
      showToast(err.message || 'Failed to save attendance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics
  const totalInClass = roster.length;
  const presentCount = roster.filter((r) => r.status === 'Present').length;
  const absentCount = roster.filter((r) => r.status === 'Absent').length;
  const attendanceRate = totalInClass > 0 ? ((presentCount / totalInClass) * 100).toFixed(1) : 0;

  // Filtered Roster by local search
  const filteredRoster = roster.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.studentName.toLowerCase().includes(q) ||
      item.studentNumber.toLowerCase().includes(q) ||
      item.rollNumber?.includes(q) ||
      item.guardianPhone?.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Daily Attendance
          </h1>
          <p className="text-xs text-outline mt-1">
            Class-wise student attendance registry and morning roll call for Greenwood Academy.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewHistory(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !viewHistory
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Roll Call Sheet
          </button>
          <button
            onClick={() => setViewHistory(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewHistory
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            History & Logs
          </button>
        </div>
      </div>

      {!viewHistory ? (
        <>
          {/* KPI Cards Row (Image 5.png) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total in Class"
              value={totalInClass}
              icon="groups"
              accentBarColor="bg-primary"
            />
            <KpiCard
              label="Present"
              value={presentCount}
              icon="check_circle"
              badgeText={`${attendanceRate}%`}
              badgeType="positive"
              accentBarColor="bg-[#166534]"
            />
            <KpiCard
              label="Absent"
              value={absentCount}
              icon="cancel"
              badgeText={absentCount > 0 ? `${absentCount} absent` : 'None'}
              badgeType={absentCount > 0 ? 'error' : 'positive'}
              accentBarColor="bg-error"
            />
            <KpiCard
              label="Rate"
              value={`${attendanceRate}%`}
              icon="percent"
              badgeText={Number(attendanceRate) >= 90 ? 'Healthy' : 'Below Target'}
              badgeType={Number(attendanceRate) >= 90 ? 'positive' : 'warning'}
              accentBarColor="bg-secondary"
            />
          </div>

          {/* Control & Selector Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Class Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                  Class & Section
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Section {c.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                  Roll Call Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
                />
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                  Search Student
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-outline text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, roll, or ID..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto pt-2 md:pt-0">
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-xs hover:bg-tertiary-fixed-dim transition-colors cursor-pointer"
                title="Mark all students present"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Mark All Present</span>
              </button>
              <button
                onClick={handleResetStatus}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface-variant font-semibold text-xs hover:bg-surface-container transition-colors cursor-pointer"
                title="Reset modifications"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Roster Table (Image 5.png) */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            {loading ? (
              <LoadingState message="Fetching class attendance roster..." />
            ) : filteredRoster.length === 0 ? (
              <EmptyState
                icon="event_busy"
                title="No students found in this roster"
                description="Make sure students are enrolled in this class."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold w-16">Roll #</th>
                      <th className="py-3 px-4 font-semibold">Student Name</th>
                      <th className="py-3 px-4 font-semibold">Student Number</th>
                      <th className="py-3 px-4 font-semibold">Gender</th>
                      <th className="py-3 px-4 font-semibold">Guardian Phone</th>
                      <th className="py-3 px-4 font-semibold text-center w-48">Attendance Status</th>
                      <th className="py-3 px-4 font-semibold">Remarks / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredRoster.map((item, idx) => (
                      <tr key={item.studentNumber || idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-on-surface">
                          {item.rollNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.photoUrl ? (
                              <img
                                src={item.photoUrl}
                                alt={item.studentName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center">
                                {item.initials || 'ST'}
                              </div>
                            )}
                            <span className="font-semibold text-on-surface">{item.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-outline">
                          {item.studentNumber}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          {item.gender}
                        </td>
                        <td className="py-3 px-4 font-mono text-outline">
                          {item.guardianPhone}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {/* Segmented Present / Absent Toggle */}
                          <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'Present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                item.status === 'Present'
                                  ? 'bg-[#166534] text-white shadow-sm'
                                  : 'text-outline hover:text-on-surface'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              <span>Present</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(idx, 'Absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                item.status === 'Absent'
                                  ? 'bg-[#ba1a1a] text-white shadow-sm'
                                  : 'text-outline hover:text-on-surface'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.remarks || ''}
                            onChange={(e) => handleRemarksChange(idx, e.target.value)}
                            placeholder={item.status === 'Absent' ? 'Reason for absence...' : 'Optional notes...'}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white transition-colors"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar for Saving Attendance */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 z-30 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hasChanges ? 'bg-amber-500 animate-pulse' : 'bg-[#166534]'
                }`}
              />
              <span className="text-xs font-medium text-on-surface">
                {hasChanges
                  ? 'Unsaved attendance changes pending review'
                  : 'All attendance records synced with database'}
              </span>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl shadow-md hover:bg-[#00174b] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Attendance...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>Save Attendance Sheet</span>
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        /* History & Logs View */
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Attendance Audit Log
              </h2>
              <p className="text-xs text-outline">
                Historical records of daily roll calls at Greenwood Academy
              </p>
            </div>
            <button
              onClick={() => setViewHistory(false)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs font-semibold hover:bg-surface-container-low transition-colors"
            >
              Return to Live Sheet
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 text-outline text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Date</th>
                  <th className="py-2.5 font-semibold">Class</th>
                  <th className="py-2.5 font-semibold">Student Name</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {historyList.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 font-mono text-outline">{log.date}</td>
                    <td className="py-2.5 font-medium text-on-surface">{log.className}</td>
                    <td className="py-2.5 text-on-surface font-semibold">{log.studentName}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          log.status === 'Present'
                            ? 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-outline italic">{log.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
