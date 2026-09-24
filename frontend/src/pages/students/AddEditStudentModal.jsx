import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

export const AddEditStudentModal = ({ isOpen, onClose, studentToEdit, onStudentSaved }) => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '2021-01-15',
    classId: '',
    className: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    admissionDate: new Date().toISOString().split('T')[0],
    rollNumber: '',
    totalFee: 30000,
    paidFee: 0,
    status: 'Active',
  });

  useEffect(() => {
    classService.getClasses().then((clsList) => {
      // Active classes only for new student selection
      setClasses(clsList);
      if (!studentToEdit && clsList.length > 0 && !formData.classId) {
        const defaultClass = clsList.find((c) => c.status === 'Active') || clsList[0];
        setFormData((prev) => ({
          ...prev,
          classId: defaultClass.id,
          className: `${defaultClass.name} - ${defaultClass.section}`,
          totalFee: defaultClass.annualFee || 30000,
        }));
      }
    });
  }, [studentToEdit]);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        studentId: studentToEdit.studentId || '',
        firstName: studentToEdit.firstName || '',
        lastName: studentToEdit.lastName || '',
        gender: studentToEdit.gender || 'Male',
        dateOfBirth: studentToEdit.dateOfBirth || '',
        classId: studentToEdit.classId || '',
        className: studentToEdit.className || '',
        parentName: studentToEdit.parentName || '',
        parentPhone: studentToEdit.parentPhone || '',
        parentEmail: studentToEdit.parentEmail || '',
        address: studentToEdit.address || '',
        admissionDate: studentToEdit.admissionDate || '',
        rollNumber: studentToEdit.rollNumber || '',
        totalFee: studentToEdit.totalFee || 30000,
        paidFee: studentToEdit.paidFee || 0,
        status: studentToEdit.status || 'Active',
      });
    } else {
      setFormData({
        studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
        firstName: '',
        lastName: '',
        gender: 'Male',
        dateOfBirth: '2021-04-10',
        classId: classes[0]?.id || 'cls-jkg-a',
        className: classes[0] ? `${classes[0].name} - ${classes[0].section}` : 'Junior KG - A',
        parentName: '',
        parentPhone: '+91 ',
        parentEmail: '',
        address: '',
        admissionDate: new Date().toISOString().split('T')[0],
        rollNumber: '',
        totalFee: classes[0]?.annualFee || 30000,
        paidFee: 0,
        status: 'Active',
      });
    }
    setErrorMessage('');
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    const selectedCls = classes.find((c) => c.id === selectedId);
    if (selectedCls) {
      setFormData((prev) => ({
        ...prev,
        classId: selectedId,
        className: `${selectedCls.name} - ${selectedCls.section}`,
        totalFee: selectedCls.annualFee || prev.totalFee,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Form Validations
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Please provide both first and last name.');
      return;
    }
    if (!formData.studentId.trim()) {
      setErrorMessage('Student ID is required.');
      return;
    }
    if (!formData.parentName.trim() || !formData.parentPhone.trim()) {
      setErrorMessage('Parent/Guardian name and contact phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (studentToEdit) {
        await studentService.updateStudent(studentToEdit.id, formData);
        showToast(`Student ${formData.firstName} ${formData.lastName} updated successfully.`);
      } else {
        await studentService.createStudent(formData);
        showToast(`Student ${formData.firstName} ${formData.lastName} registered successfully.`);
      }
      onStudentSaved();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save student profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#0b1c30]/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-outline-variant/30 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
          <div>
            <h2 className="text-base font-bold font-headline text-on-surface">
              {studentToEdit ? 'Edit Student Profile' : 'Register New Student'}
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Academic Year 2026–27 • Greenwood Academy
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section: Academic Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              <span>Academic Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Student Unique ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. STU-2026-009"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-mono focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g. 09"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Aarav"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Class Cohort & Fee */}
          <div className="space-y-3 pt-2 border-t border-outline-variant/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">meeting_room</span>
              <span>Class Assignment & Annual Fee</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Class & Section *
                </label>
                <select
                  value={formData.classId}
                  onChange={handleClassChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                >
                  {classes
                    .filter((c) => c.status === 'Active' || c.id === formData.classId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.section} ({c.academicYear})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Annual Tuition Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-mono font-bold focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Enrollment Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {studentToEdit && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Paid Fee to Date (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalFee}
                    value={formData.paidFee}
                    onChange={(e) => setFormData({ ...formData, paidFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-mono focus:outline-none focus:border-secondary focus:bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Parent / Guardian Info */}
          <div className="space-y-3 pt-2 border-t border-outline-variant/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">family_restroom</span>
              <span>Parent / Guardian Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Guardian Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Parent Email Address
              </label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="rajesh.sharma@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Residential Address
              </label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Flat 402, Sunshine Enclave, Kharadi, Pune"
                className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary focus:bg-white"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-[#00174b] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{studentToEdit ? 'Update Student' : 'Save & Register Student'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditStudentModal;
