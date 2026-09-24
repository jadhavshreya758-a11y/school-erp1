import React from 'react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentDetailsModal = ({ isOpen, onClose, student, onEdit, onDeactivate, onRecordPayment }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between bg-surface-container-low rounded-t-2xl">
          <div className="flex items-center gap-4">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.firstName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-bold text-lg flex items-center justify-center shadow-sm">
                {student.initials || `${student.firstName[0]}${student.lastName[0]}`}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-headline text-on-surface">
                  {student.firstName} {student.lastName}
                </h2>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-xs text-outline font-mono mt-0.5">
                ID: {student.studentId} • Roll #{student.rollNumber || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable details */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Academic Placement */}
          <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-outline text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">school</span>
              <span>Academic Details</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-outline">Assigned Cohort</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.className}</p>
              </div>
              <div>
                <p className="text-outline">Gender</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.gender || '—'}</p>
              </div>
              <div>
                <p className="text-outline">Date of Birth</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.dateOfBirth || '—'}</p>
              </div>
              <div>
                <p className="text-outline">Admission Date</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.admissionDate || '—'}</p>
              </div>
            </div>
          </div>

          {/* Fee Status Summary */}
          <div className="border border-outline-variant/30 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-outline text-[11px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
                <span>Tuition Fee Summary</span>
              </h3>
              {student.pendingFee > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    if (onRecordPayment) onRecordPayment(student);
                  }}
                  className="px-2.5 py-1 bg-secondary text-white rounded-lg text-xs font-semibold hover:bg-[#003ea8] transition-colors"
                >
                  Collect ₹{student.pendingFee.toLocaleString('en-IN')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="bg-surface-container-low p-3 rounded-xl">
                <p className="text-outline">Total Annual Fee</p>
                <p className="font-mono font-bold text-on-surface text-base tabular-nums mt-0.5">
                  ₹{(student.totalFee || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-tertiary-fixed/20 p-3 rounded-xl">
                <p className="text-on-tertiary-fixed-variant">Paid to Date</p>
                <p className="font-mono font-bold text-on-tertiary-fixed-variant text-base tabular-nums mt-0.5">
                  ₹{(student.paidFee || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-error-container/30 p-3 rounded-xl">
                <p className="text-error">Pending Balance</p>
                <p className="font-mono font-bold text-error text-base tabular-nums mt-0.5">
                  ₹{(student.pendingFee || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Parent & Contact Information */}
          <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-outline text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">contact_phone</span>
              <span>Parent & Guardian Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-outline">Primary Guardian</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.parentName || '—'}</p>
              </div>
              <div>
                <p className="text-outline">Phone Contact</p>
                <p className="font-semibold font-mono text-on-surface text-sm mt-0.5">
                  {student.parentPhone || '—'}
                </p>
              </div>
              <div>
                <p className="text-outline">Email Address</p>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{student.parentEmail || '—'}</p>
              </div>
              <div>
                <p className="text-outline">Residential Address</p>
                <p className="text-on-surface text-xs mt-0.5 leading-relaxed">{student.address || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low rounded-b-2xl flex items-center justify-between">
          <div>
            {student.status === 'Active' ? (
              <button
                onClick={() => {
                  onClose();
                  if (onDeactivate) onDeactivate(student);
                }}
                className="px-3 py-1.5 rounded-lg border border-error text-error text-xs font-semibold hover:bg-error-container/50 transition-colors"
              >
                Deactivate Student
              </button>
            ) : (
              <span className="text-xs text-outline italic">Student is currently marked Inactive.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onEdit) onEdit(student);
              }}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#00174b] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
