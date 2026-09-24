import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

export const Classes = () => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: 'Class 3',
    section: 'A',
    academicYear: 'AY 2026–27',
    classTeacher: 'Mrs. Rekha Patil',
    room: 'Room 205',
    capacity: 30,
    annualFee: 40000,
    status: 'Active',
  });

  const loadClasses = async () => {
    try {
      const list = await classService.getClasses();
      setClasses(list);
    } catch {
      showToast('Failed to load classes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      section: 'A',
      academicYear: 'AY 2026–27',
      classTeacher: '',
      room: '',
      capacity: 25,
      annualFee: 32000,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      academicYear: cls.academicYear,
      classTeacher: cls.classTeacher || '',
      room: cls.room || '',
      capacity: cls.capacity || 25,
      annualFee: cls.annualFee || 30000,
      status: cls.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, formData);
        showToast(`Class ${formData.name} - ${formData.section} updated successfully.`);
      } else {
        await classService.createClass(formData);
        showToast(`Class ${formData.name} - ${formData.section} created successfully.`);
      }
      setIsModalOpen(false);
      loadClasses();
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await classService.deactivateClass(deactivateTarget.id);
      showToast(`Class ${deactivateTarget.name} - ${deactivateTarget.section} deactivated.`);
      setDeactivateTarget(null);
      loadClasses();
    } catch {
      showToast('Failed to deactivate class.', 'error');
    }
  };

  const totalClasses = classes.length;
  const activeCohorts = classes.filter((c) => c.status === 'Active').length;
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.enrolled || 0), 0);

  const filteredClasses = classes.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.section.toLowerCase().includes(q) ||
      c.classTeacher?.toLowerCase().includes(q) ||
      c.room?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Classes & Academic Cohorts
          </h1>
          <p className="text-xs text-outline mt-1">
            Section management, classroom allocations, capacity tracking, and teacher assignments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          <span>Add New Cohort</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Cohorts"
          value={totalClasses}
          icon="meeting_room"
          accentBarColor="bg-primary"
        />
        <KpiCard
          label="Active Cohorts"
          value={activeCohorts}
          icon="check_circle"
          accentBarColor="bg-[#166534]"
        />
        <KpiCard
          label="Total Capacity"
          value={totalCapacity}
          icon="event_seat"
          accentBarColor="bg-secondary"
        />
        <KpiCard
          label="Capacity Utilization"
          value={totalCapacity > 0 ? `${((totalEnrolled / totalCapacity) * 100).toFixed(0)}%` : '0%'}
          icon="pie_chart"
          accentBarColor="bg-tertiary"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cohorts by name, section, teacher, or room..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      {/* Classes Grid Cards */}
      {loading ? (
        <LoadingState message="Loading academic cohorts..." />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          icon="meeting_room"
          title="No cohorts found"
          description="Create a new class or adjust your filter."
          actionText="Add Cohort"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const utilization = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;
            return (
              <div
                key={cls.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-bold text-base text-on-surface">
                          {cls.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
                          Sec {cls.section}
                        </span>
                      </div>
                      <p className="text-xs text-outline font-mono mt-0.5">{cls.academicYear}</p>
                    </div>
                    <StatusBadge status={cls.status} />
                  </div>

                  {/* Room & Teacher info */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-outline">person</span>
                      <span>Class Teacher: <strong className="font-semibold">{cls.classTeacher || 'Unassigned'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-outline">door_front</span>
                      <span>Location: <span className="font-mono text-outline">{cls.room || 'Room TBA'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[16px] text-outline">payments</span>
                      <span>Annual Tuition: <strong className="font-mono font-bold text-primary">₹{(cls.annualFee || 0).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Meter */}
                <div className="pt-3 border-t border-outline-variant/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">Enrollment</span>
                    <span className="font-bold text-on-surface font-mono">
                      {cls.enrolled} / {cls.capacity} students ({utilization}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilization >= 100
                          ? 'bg-amber-500'
                          : utilization >= 80
                          ? 'bg-[#166534]'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="px-2.5 py-1 text-xs font-semibold text-secondary hover:underline cursor-pointer"
                    >
                      Edit Cohort
                    </button>
                    {cls.status === 'Active' && (
                      <button
                        onClick={() => setDeactivateTarget(cls)}
                        className="px-2.5 py-1 text-xs font-semibold text-error hover:underline cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold font-headline text-on-surface">
                {editingClass ? 'Edit Cohort' : 'Create New Cohort'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Junior KG"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Section *</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Class Teacher</label>
                  <input
                    type="text"
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                    placeholder="e.g. Mrs. Anjali D."
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Room 102"
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Student Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-1">Annual Fee (₹)</label>
                  <input
                    type="number"
                    step="500"
                    value={formData.annualFee}
                    onChange={(e) => setFormData({ ...formData, annualFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-[#00174b]"
                >
                  Save Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deactivateTarget}
        title="Deactivate Academic Cohort"
        message={`Are you sure you want to deactivate ${deactivateTarget?.name} - ${deactivateTarget?.section}? Inactive cohorts cannot receive new student enrollments.`}
        confirmText="Yes, Deactivate"
        isDestructive={true}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
};

export default Classes;
