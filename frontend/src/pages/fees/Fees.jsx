import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { classService } from '../../services/classService';
import { KpiCard } from '../../components/common/KpiCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { RecordPaymentDrawer } from './RecordPaymentDrawer';
import { useToast } from '../../context/ToastContext';

export const Fees = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'pending');
  const [loading, setLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState({
    annualTargetAmount: 3840000,
    totalCollectedAmount: 3125500,
    totalPendingAmount: 714500,
    monthlyLogged: 384500,
  });

  const [pendingList, setPendingList] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState(null);
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // Edit fee structure modal
  const [editingFeeStructure, setEditingFeeStructure] = useState(null);
  const [newFeeAmount, setNewFeeAmount] = useState('');

  const loadAllFeeData = async () => {
    setLoading(true);
    try {
      const [pendingData, structures, payments, stuList, clsList] = await Promise.all([
        feeService.getPendingFees(),
        feeService.getFeeStructures(),
        paymentService.getPayments(),
        studentService.getStudents(),
        classService.getClasses(),
      ]);

      setMetrics({
        annualTargetAmount: pendingData.annualTargetAmount || 3840000,
        totalCollectedAmount: pendingData.totalCollectedAmount || 3125500,
        totalPendingAmount: pendingData.totalPendingAmount || 714500,
        monthlyLogged: 384500,
      });

      setPendingList(pendingData.pendingList);
      setFeeStructures(structures);
      setPaymentsList(payments);
      setStudents(stuList);
      setClasses(clsList);

      // Handle query param for student preselection
      const paramStudentId = searchParams.get('studentId');
      if (paramStudentId) {
        const found = pendingData.pendingList.find(
          (p) => p.studentId === paramStudentId || p.studentNumber === paramStudentId
        );
        if (found) {
          setStudentForPayment(found);
          setIsDrawerOpen(true);
        }
      }
    } catch {
      showToast('Failed to load fee records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFeeData();
  }, []);

  const handleOpenCollect = (student) => {
    setStudentForPayment(student);
    setIsDrawerOpen(true);
  };

  const handleUpdateFeeStructure = async () => {
    if (!editingFeeStructure || !newFeeAmount) return;
    try {
      await feeService.updateFeeStructure(editingFeeStructure.id, {
        annualFee: Number(newFeeAmount),
      });
      showToast(`Updated annual fee for ${editingFeeStructure.className}.`);
      setEditingFeeStructure(null);
      loadAllFeeData();
    } catch (err) {
      showToast(err.message || 'Failed to update fee structure.', 'error');
    }
  };

  // Filtered pending accounts
  const filteredPending = pendingList.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        item.studentName.toLowerCase().includes(q) ||
        item.studentNumber.toLowerCase().includes(q) ||
        item.guardianPhone?.includes(q);
      if (!match) return false;
    }
    if (selectedClass !== 'All') {
      if (!item.className.toLowerCase().includes(selectedClass.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Filtered payments
  const filteredPayments = paymentsList.filter((pay) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        pay.studentName.toLowerCase().includes(q) ||
        pay.receiptNo.toLowerCase().includes(q) ||
        pay.referenceId?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMode !== 'All') {
      if (pay.mode.toLowerCase() !== selectedMode.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header (Image 7.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Fee Collection & Pending Dues
          </h1>
          <p className="text-xs text-outline mt-1">
            Real-time fee reconciliation, collections, and outstanding tuition balances for Greenwood Academy.
          </p>
        </div>

        <button
          onClick={() => {
            setStudentForPayment(null);
            setIsDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* KPI Cards Row (Image 7.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Annual Target"
          value={`₹${metrics.annualTargetAmount.toLocaleString('en-IN')}`}
          icon="flag"
          badgeText="AY 2026–27"
          badgeType="neutral"
          accentBarColor="bg-primary"
        />
        <KpiCard
          label="Total Realized"
          value={`₹${metrics.totalCollectedAmount.toLocaleString('en-IN')}`}
          icon="verified"
          badgeText="81.4% realized"
          badgeType="positive"
          accentBarColor="bg-[#166534]"
        />
        <KpiCard
          label="Net Outstanding"
          value={`₹${metrics.totalPendingAmount.toLocaleString('en-IN')}`}
          icon="hourglass_top"
          badgeText="Overdue alert"
          badgeType="error"
          accentBarColor="bg-error"
        />
        <KpiCard
          label="Logged This Month"
          value={`₹${metrics.monthlyLogged.toLocaleString('en-IN')}`}
          icon="receipt_long"
          badgeText="42 receipts"
          badgeType="positive"
          accentBarColor="bg-secondary"
        />
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">pending_actions</span>
          <span>Pending Fees Register ({pendingList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">receipt</span>
          <span>Payment History ({paymentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'structures'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>Fee Structures by Class</span>
        </button>
      </div>

      {/* Tab Content 1: Pending Fees Register (Image 7.png table) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pending dues by student name, ID, or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
              >
                <option value="All">All Cohorts</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} - {c.section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pending Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            {loading ? (
              <LoadingState message="Calculating outstanding balances..." />
            ) : filteredPending.length === 0 ? (
              <EmptyState
                icon="task_alt"
                title="No pending fee balances!"
                description="All students in selected cohorts have cleared their dues or no matches found."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Student Name</th>
                      <th className="py-3 px-4 font-semibold">Class</th>
                      <th className="py-3 px-4 font-semibold text-right">Annual Fee</th>
                      <th className="py-3 px-4 font-semibold text-right">Paid to Date</th>
                      <th className="py-3 px-4 font-semibold text-right text-error">Pending Balance</th>
                      <th className="py-3 px-4 font-semibold">Parent / Guardian</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredPending.map((p) => (
                      <tr key={p.studentId} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center">
                              {p.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-on-surface">{p.studentName}</p>
                              <p className="text-[11px] font-mono text-outline">{p.studentNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant font-medium">
                          {p.className}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-on-surface tabular-nums">
                          ₹{p.annualFee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534] tabular-nums">
                          ₹{p.paidToDate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-error tabular-nums">
                          ₹{p.pendingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-on-surface font-medium">{p.guardianName}</p>
                          <p className="text-[11px] font-mono text-outline">{p.guardianPhone}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenCollect(p)}
                            className="px-3 py-1.5 bg-secondary text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer"
                          >
                            Collect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Payment Transaction History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search receipts by receipt #, student name, or ref ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="All">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Receipt #</th>
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Class</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3 px-4 font-semibold">Mode</th>
                    <th className="py-3 px-4 font-semibold">Reference ID</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-primary">{pay.receiptNo}</td>
                      <td className="py-3 px-4 font-semibold text-on-surface">{pay.studentName}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{pay.className}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-on-surface tabular-nums">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[11px] font-medium">
                          {pay.mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-outline text-[11px]">{pay.referenceId}</td>
                      <td className="py-3 px-4 font-mono text-outline text-[11px]">{pay.date}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setReceiptToPrint(pay)}
                          className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs rounded-lg border border-outline-variant/30 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">print</span>
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Fee Structures by Class */}
      {activeTab === 'structures' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Academic Fee Structures
              </h2>
              <p className="text-xs text-outline">
                Defined annual tuition rates by class level for Greenwood Academy (AY 2026–27)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 text-outline text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Class / Cohort</th>
                  <th className="py-3 px-4 font-semibold">Academic Year</th>
                  <th className="py-3 px-4 font-semibold text-right">Annual Tuition Rate</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {feeStructures.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{f.className}</td>
                    <td className="py-3 px-4 text-outline font-mono">{f.academicYear}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-primary text-sm tabular-nums">
                      ₹{f.annualFee.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingFeeStructure(f);
                          setNewFeeAmount(String(f.annualFee));
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-secondary hover:underline cursor-pointer"
                      >
                        Edit Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Fee Payment Drawer */}
      <RecordPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedStudent={studentForPayment}
        allStudents={students}
        onPaymentRecorded={loadAllFeeData}
      />

      {/* Edit Fee Structure Modal */}
      {editingFeeStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
            <h3 className="text-sm font-bold font-headline text-on-surface">
              Edit Fee: {editingFeeStructure.className}
            </h3>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Annual Tuition Fee (₹)
              </label>
              <input
                type="number"
                step="500"
                value={newFeeAmount}
                onChange={(e) => setNewFeeAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingFeeStructure(null)}
                className="px-3 py-1.5 text-xs text-outline hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFeeStructure}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#00174b]"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Printable Preview Modal */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-5 animate-in zoom-in-95 duration-150">
            {/* School Header */}
            <div className="text-center pb-4 border-b border-outline-variant/30">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[24px] text-primary">school</span>
                <span className="font-headline font-bold text-lg text-primary">GREENWOOD ACADEMY</span>
              </div>
              <p className="text-[11px] text-outline">
                Plot 42, Kharadi, Pune, Maharashtra 411014 • AY 2026–27
              </p>
              <p className="text-xs font-bold text-on-surface uppercase tracking-wider mt-2 bg-surface-container-low py-1 rounded-md">
                Official Tuition Fee Receipt
              </p>
            </div>

            {/* Receipt Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-outline block text-[11px]">Receipt Number</span>
                <span className="font-mono font-bold text-primary">{receiptToPrint.receiptNo}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Date of Receipt</span>
                <span className="font-mono font-semibold">{receiptToPrint.date}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Student Name</span>
                <span className="font-bold text-on-surface">{receiptToPrint.studentName}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Class & Cohort</span>
                <span className="font-medium text-on-surface">{receiptToPrint.className}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Payment Mode</span>
                <span className="font-medium">{receiptToPrint.mode}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Transaction Ref</span>
                <span className="font-mono text-outline">{receiptToPrint.referenceId}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="p-4 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-tertiary-fixed-variant uppercase">
                  Amount Received
                </span>
                <p className="text-xs text-outline">{receiptToPrint.remarks || 'Tuition Clearance'}</p>
              </div>
              <span className="font-mono text-xl font-bold text-on-tertiary-fixed-variant tabular-nums">
                ₹{receiptToPrint.amount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Footer Signature */}
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 text-xs">
              <div>
                <p className="font-semibold text-on-surface">Mrs. Sunita Rao</p>
                <p className="text-[11px] text-outline">Authorized Signatory / Principal</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReceiptToPrint(null)}
                  className="px-3 py-1.5 text-xs text-outline hover:text-on-surface"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast('Receipt printed to PDF successfully.');
                    setReceiptToPrint(null);
                  }}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-[#00174b] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
