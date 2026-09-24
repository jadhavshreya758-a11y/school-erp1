import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { AddEditStudentModal } from './AddEditStudentModal';
import { StudentDetailsModal } from './StudentDetailsModal';
import { useToast } from '../../context/ToastContext';

export const Students = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddEditOpen(true);
      setStudentToEdit(null);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [stuList, clsList] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses(),
      ]);
      setStudents(stuList);
      setClasses(clsList);
    } catch (err) {
      console.error(err);
      showToast('Failed to load students roster.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.parentPhone?.includes(q) ||
        s.parentName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedClass !== 'All') {
      if (s.classId !== selectedClass && !s.className?.includes(selectedClass)) {
        return false;
      }
    }

    if (selectedStatus !== 'All') {
      if (s.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const inactiveCount = students.filter((s) => s.status === 'Inactive').length;
  const newThisMonth = 6;

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await studentService.deactivateStudent(deactivateTarget.id);
      showToast(`Student ${deactivateTarget.firstName} marked Inactive.`);
      setDeactivateTarget(null);
      loadData();
    } catch {
      showToast('Failed to deactivate student.', 'error');
    }
  };

  const handleReactivate = async (student) => {
    try {
      await studentService.reactivateStudent(student.id);
      showToast(`Student ${student.firstName} reactivated.`);
      loadData();
    } catch {
      showToast('Failed to reactivate student.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Students Roster
          </h1>
          <p className="text-xs text-outline mt-1">
            Manage student profiles, enrollment status, and records for Greenwood Academy.
          </p>
        </div>
        <button
          onClick={() => {
            setStudentToEdit(null);
            setIsAddEditOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Student</span>
        </button>
      </div>

      {/* KPI Cards Row (Image 1.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Enrolled"
          value={totalCount}
          icon="school"
          accentBarColor="bg-primary"
        />
        <KpiCard
          label="Active Students"
          value={activeCount}
          icon="check_circle"
          accentBarColor="bg-[#166534]"
        />
        <KpiCard
          label="Inactive"
          value={inactiveCount}
          icon="person_off"
          accentBarColor="bg-error"
        />
        <KpiCard
          label="New This Month"
          value={newThisMonth}
          icon="fiber_new"
          accentBarColor="bg-secondary"
        />
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, or guardian contact..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchQuery || selectedClass !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('All');
                setSelectedStatus('All');
              }}
              className="p-2 text-xs text-outline hover:text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
              title="Reset Filters"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Fetching student rosters..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon="school"
            title="No students matched your search"
            description="Adjust your search terms or register a new student using the button above."
            actionText="Add New Student"
            onAction={() => {
              setStudentToEdit(null);
              setIsAddEditOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Student ID</th>
                  <th className="py-3 px-4 font-semibold">Class & Sec</th>
                  <th className="py-3 px-4 font-semibold">Parent / Guardian</th>
                  <th className="py-3 px-4 font-semibold">Contact Number</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                    onClick={() => setStudentDetails(student)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.firstName}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/40 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {student.initials || `${student.firstName[0]}${student.lastName[0]}`}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-on-surface text-xs">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-outline">
                            Roll #{student.rollNumber || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-4 font-medium text-on-surface-variant">
                      {student.className}
                    </td>
                    <td className="py-3 px-4 text-on-surface">
                      {student.parentName}
                    </td>
                    <td className="py-3 px-4 font-mono text-outline">
                      {student.parentPhone}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setStudentDetails(student)}
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                          title="View Profile Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => {
                            setStudentToEdit(student);
                            setIsAddEditOpen(true);
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        {student.status === 'Active' ? (
                          <button
                            onClick={() => setDeactivateTarget(student)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                            title="Deactivate Student"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_off</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(student)}
                            className="p-1.5 text-on-surface-variant hover:text-[#166534] hover:bg-tertiary-fixed/30 rounded-lg transition-colors"
                            title="Reactivate Student"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between text-xs text-outline">
          <span>Showing {filteredStudents.length} of {totalCount} students</span>
          <span className="font-mono">Greenwood Academy • Database Status: Operational</span>
        </div>
      </div>

      {/* Add / Edit Drawer Modal */}
      <AddEditStudentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        studentToEdit={studentToEdit}
        onStudentSaved={loadData}
      />

      {/* Student Details View Modal */}
      <StudentDetailsModal
        isOpen={!!studentDetails}
        onClose={() => setStudentDetails(null)}
        student={studentDetails}
        onEdit={(student) => {
          setStudentToEdit(student);
          setIsAddEditOpen(true);
        }}
        onDeactivate={(student) => {
          setDeactivateTarget(student);
        }}
        onRecordPayment={(student) => {
          navigate(`/fees?tab=collect&studentId=${student.id}`);
        }}
      />

      {/* Confirmation Modal for Deactivation */}
      <ConfirmationModal
        isOpen={!!deactivateTarget}
        title="Deactivate Student Record"
        message={`Are you sure you want to deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? They will be marked as Inactive and excluded from active class attendance rosters.`}
        confirmText="Yes, Deactivate"
        isDestructive={true}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
};

export default Students;
