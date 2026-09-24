import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';

export const RecordPaymentDrawer = ({
  isOpen,
  onClose,
  selectedStudent,
  allStudents = [],
  onPaymentRecorded,
}) => {
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceId, setReferenceId] = useState('');
  const [remarks, setRemarks] = useState('Tuition fee installment');
  const [receiptNo, setReceiptNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedStudent) {
      setStudent(selectedStudent);
      setAmount(String(selectedStudent.pendingBalance || selectedStudent.pendingFee || ''));
      setReceiptNo(`REC-2026-${Math.floor(100 + Math.random() * 900)}`);
      setReferenceId(`UPI-${Date.now().toString().slice(-6)}`);
      setErrorMsg('');
    } else if (allStudents.length > 0) {
      const firstWithPending = allStudents.find((s) => s.pendingFee > 0) || allStudents[0];
      setStudent(firstWithPending);
      setAmount(String(firstWithPending.pendingFee || ''));
      setReceiptNo(`REC-2026-${Math.floor(100 + Math.random() * 900)}`);
      setReferenceId(`UPI-${Date.now().toString().slice(-6)}`);
      setErrorMsg('');
    }
  }, [selectedStudent, isOpen, allStudents]);

  if (!isOpen || !student) return null;

  const currentPending = student.pendingBalance ?? student.pendingFee ?? 0;
  const numAmount = Number(amount) || 0;
  const newPending = Math.max(0, currentPending - numAmount);
  const isOverpayment = numAmount > currentPending;

  const handleStudentSelect = (e) => {
    const found = allStudents.find((s) => s.id === e.target.value || s.studentId === e.target.value);
    if (found) {
      setStudent(found);
      setAmount(String(found.pendingFee || 0));
      setErrorMsg('');
    }
  };

  const handleModeChange = (mode) => {
    setPaymentMode(mode);
    if (mode === 'Cash') {
      setReferenceId(`CASH-${Date.now().toString().slice(-4)}`);
    } else if (mode === 'Bank Transfer') {
      setReferenceId(`NEFT-HDFC-${Date.now().toString().slice(-5)}`);
    } else {
      setReferenceId(`UPI-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    if (isOverpayment) {
      setErrorMsg(
        `Payment amount (₹${numAmount.toLocaleString('en-IN')}) cannot exceed current pending dues (₹${currentPending.toLocaleString('en-IN')}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await paymentService.createPayment({
        studentId: student.id || student.studentId,
        amount: numAmount,
        paymentDate,
        paymentMode,
        receiptNo,
        referenceId,
        remarks,
      });

      showToast(`Payment of ₹${numAmount.toLocaleString('en-IN')} recorded successfully.`);
      if (onPaymentRecorded) onPaymentRecorded(res);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Payment recording failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#0b1c30]/50 backdrop-blur-xs">
      <div className="bg-surface-container-lowest w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-outline-variant/30 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
          <div>
            <h2 className="text-base font-bold font-headline text-on-surface">
              Record Fee Payment
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Generate official receipt & update student ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-error-container text-on-error-container flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Selector / Mini Profile */}
          <div className="bg-surface-container-low p-4 rounded-xl space-y-3 border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
                Selected Student
              </span>
              <span className="text-[11px] font-mono text-primary font-bold">
                {student.studentNumber || student.studentId}
              </span>
            </div>

            {/* Dropdown if student wasn't preselected */}
            {!selectedStudent && allStudents.length > 0 && (
              <select
                value={student.id || student.studentId}
                onChange={handleStudentSelect}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant/50 bg-white text-on-surface focus:outline-none focus:border-secondary"
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.className}) — Pending: ₹{(s.pendingFee || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-sm flex items-center justify-center flex-shrink-0">
                {student.initials || `${student.firstName?.[0] || 'S'}${student.lastName?.[0] || 'T'}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-sm truncate">
                  {student.studentName || `${student.firstName} ${student.lastName}`}
                </p>
                <p className="text-outline truncate">{student.className}</p>
              </div>
            </div>

            {/* Financial Ledger Snapshot */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20">
              <div>
                <span className="text-outline block text-[11px]">Total Annual Fee</span>
                <span className="font-mono font-semibold text-on-surface text-xs">
                  ₹{(student.annualFee || student.totalFee || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Current Outstanding</span>
                <span className="font-mono font-bold text-error text-xs">
                  ₹{currentPending.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Input & Calculation Preview */}
          <div className="space-y-2">
            <label className="block font-semibold text-on-surface">
              Payment Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold font-mono text-outline text-sm">
                ₹
              </span>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to collect..."
                className={`w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border ${
                  isOverpayment ? 'border-error bg-error-container/20 text-error' : 'border-outline-variant/50 bg-surface-container-low text-on-surface'
                } focus:outline-none focus:border-secondary focus:bg-white`}
              />
            </div>

            {/* Overpayment Alert / New Pending Balance calculation */}
            {isOverpayment ? (
              <p className="text-error font-medium text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Amount exceeds current pending dues of ₹{currentPending.toLocaleString('en-IN')}.</span>
              </p>
            ) : (
              <div className="p-3 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed/50 flex items-center justify-between text-xs">
                <span className="text-on-tertiary-fixed-variant font-medium">New Pending Balance:</span>
                <span className="font-mono font-bold text-on-tertiary-fixed-variant text-sm tabular-nums">
                  ₹{newPending.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-2">
            <label className="block font-semibold text-on-surface">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'Cash', 'Bank Transfer'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                    paymentMode === mode
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {mode === 'Cash' ? 'payments' : mode === 'UPI' ? 'qr_code_2' : 'account_balance'}
                  </span>
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Date & Receipt # */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block font-semibold text-on-surface mb-1">
                Receipt Series #
              </label>
              <input
                type="text"
                readOnly
                value={receiptNo}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container text-outline font-mono focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Reference ID */}
          <div>
            <label className="block font-semibold text-on-surface mb-1">
              Transaction Reference / Note
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. UPI Ref / Bank IMPS / Cash voucher"
              className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-mono focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-on-surface mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Term 1 second installment"
              className="w-full px-3 py-2 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
            />
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
            disabled={isSubmitting || isOverpayment}
            className="px-5 py-2 text-xs font-semibold bg-primary text-white rounded-xl shadow-sm hover:bg-[#00174b] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording Payment...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">receipt</span>
                <span>Confirm & Issue Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentDrawer;
