import React, { useState, useEffect } from 'react';
import { parentService } from '../../services/parentService';
import { studentService } from '../../services/studentService';
import { KpiCard } from '../../components/common/KpiCard';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const Parents = () => {
  const { showToast } = useToast();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relation: 'Father (Primary)',
    address: '',
    studentId: '',
  });

  const loadData = async () => {
    try {
      const [parentList, studentList] = await Promise.all([
        parentService.getParents(),
        studentService.getStudents(),
      ]);
      setParents(parentList);
      setStudents(studentList);
    } catch {
      showToast('Failed to load parent records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData({
      name: '',
      phone: '+91 ',
      email: '',
      relation: 'Father (Primary)',
      address: '',
      studentId: students[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParent(p);
    setFormData({
      name: p.name,
      phone: p.phone,
      email: p.email,
      relation: p.relation,
      address: p.address,
      studentId: p.studentIds?.[0] || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        await parentService.updateParent(editingParent.id, {
          ...formData,
          studentIds: [formData.studentId],
        });
        showToast(`Guardian record for ${formData.name} updated.`);
      } else {
        await parentService.createParent({
          ...formData,
          studentIds: [formData.studentId],
        });
        showToast(`Guardian record for ${formData.name} created.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  };

  const filteredParents = parents.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Parents & Guardians Registry
          </h1>
          <p className="text-xs text-outline mt-1">
            Guardian communication directory, student relationships, and address logs.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Guardian</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Registered Guardians"
          value={parents.length}
          icon="family_restroom"
          accentBarColor="bg-primary"
        />
        <KpiCard
          label="Primary Contacts"
          value={parents.filter((p) => p.relation?.includes('Primary')).length}
          icon="contact_phone"
          accentBarColor="bg-[#166534]"
        />
        <KpiCard
          label="Active Students Linked"
          value={students.length}
          icon="child_care"
          accentBarColor="bg-secondary"
        />
        <KpiCard
          label="Verified SMS Enabled"
          value="100%"
          icon="sms"
          accentBarColor="bg-[#166534]"
        />
      </div>

      {/* Search Input */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guardians by name, phone, or address..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Loading guardians registry..." />
        ) : filteredParents.length === 0 ? (
          <EmptyState
            icon="family_restroom"
            title="No guardian profiles found"
            description="Create a new parent profile or adjust your search filter."
            actionText="Add Guardian"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Guardian Name</th>
                  <th className="py-3 px-4 font-semibold">Relationship</th>
                  <th className="py-3 px-4 font-semibold">Phone Contact</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Residential Address</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredParents.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center">
                          {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold text-on-surface">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">
                      {p.relation}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      {p.phone}
                    </td>
                    <td className="py-3 px-4 text-outline">{p.email || '—'}</td>
                    <td className="py-3 px-4 text-on-surface max-w-xs truncate">{p.address || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
                        title="Edit Guardian Profile"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-sm font-bold font-headline text-on-surface">
                {editingParent ? 'Edit Guardian Details' : 'Add New Guardian'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-outline hover:text-on-surface rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-on-surface mb-1">Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Relationship</label>
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                >
                  <option value="Father (Primary)">Father (Primary)</option>
                  <option value="Mother (Primary)">Mother (Primary)</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Relative">Relative</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rajesh.sharma@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Residential Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat 402, Sunshine Enclave, Kharadi, Pune"
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
                />
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
                  Save Guardian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parents;
