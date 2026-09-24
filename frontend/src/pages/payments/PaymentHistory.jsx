import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { KpiCard } from '../../components/common/KpiCard';
import { EmptyState, LoadingState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const PaymentHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadPayments = async () => {
    try {
      const list = await paymentService.getPayments();
      setPayments(list);
    } catch {
      showToast('Failed to load payment transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiTotal = payments.filter((p) => p.mode === 'UPI').reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashTotal = payments.filter((p) => p.mode === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankTotal = payments.filter((p) => p.mode === 'Bank Transfer').reduce((sum, p) => sum + (p.amount || 0), 0);

  const filteredPayments = payments.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        p.studentName.toLowerCase().includes(q) ||
        p.receiptNo.toLowerCase().includes(q) ||
        p.referenceId?.toLowerCase().includes(q) ||
        p.className?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMode !== 'All') {
      if (p.mode.toLowerCase() !== selectedMode.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline text-on-surface">
            Fee Payment Receipts Ledger
          </h1>
          <p className="text-xs text-outline mt-1">
            Reconciled collections history, audit trail, and printable receipts for Greenwood Academy.
          </p>
        </div>
        <button
          onClick={() => navigate('/fees?tab=collect')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-[#00174b] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Record New Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Realized"
          value={`₹${totalCollected.toLocaleString('en-IN')}`}
          icon="account_balance_wallet"
          accentBarColor="bg-primary"
        />
        <KpiCard
          label="UPI Collections"
          value={`₹${upiTotal.toLocaleString('en-IN')}`}
          icon="qr_code_2"
          accentBarColor="bg-secondary"
        />
        <KpiCard
          label="Cash Receipts"
          value={`₹${cashTotal.toLocaleString('en-IN')}`}
          icon="payments"
          accentBarColor="bg-[#166534]"
        />
        <KpiCard
          label="Bank Transfers"
          value={`₹${bankTotal.toLocaleString('en-IN')}`}
          icon="account_balance"
          accentBarColor="bg-tertiary"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipts by receipt #, student name, class, or reference ID..."
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

      {/* Receipts Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState message="Fetching payments ledger..." />
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No receipts matched your filter"
            description="Record a fee payment or clear filter terms."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-outline text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Receipt Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Class</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment Mode</th>
                  <th className="py-3 px-4 font-semibold">Txn Reference ID</th>
                  <th className="py-3 px-4 font-semibold">Receipt Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{p.receiptNo}</td>
                    <td className="py-3 px-4 font-semibold text-on-surface">{p.studentName}</td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">{p.className}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-on-surface text-sm tabular-nums">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-[11px]">
                        {p.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-outline text-[11px]">{p.referenceId}</td>
                    <td className="py-3 px-4 font-mono text-outline text-[11px]">{p.date}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs rounded-lg border border-outline-variant/30 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal Preview */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-5 animate-in zoom-in-95 duration-150">
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

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-outline block text-[11px]">Receipt Number</span>
                <span className="font-mono font-bold text-primary">{selectedReceipt.receiptNo}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Date of Receipt</span>
                <span className="font-mono font-semibold">{selectedReceipt.date}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Student Name</span>
                <span className="font-bold text-on-surface">{selectedReceipt.studentName}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Class & Cohort</span>
                <span className="font-medium text-on-surface">{selectedReceipt.className}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Payment Mode</span>
                <span className="font-medium">{selectedReceipt.mode}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Transaction Ref</span>
                <span className="font-mono text-outline">{selectedReceipt.referenceId}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-tertiary-fixed-variant uppercase">
                  Amount Received
                </span>
                <p className="text-xs text-outline">{selectedReceipt.remarks || 'Tuition Clearance'}</p>
              </div>
              <span className="font-mono text-xl font-bold text-on-tertiary-fixed-variant tabular-nums">
                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 text-xs">
              <div>
                <p className="font-semibold text-on-surface">Mrs. Sunita Rao</p>
                <p className="text-[11px] text-outline">Authorized Signatory / Principal</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-3 py-1.5 text-xs text-outline hover:text-on-surface"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast('Receipt printed to PDF.');
                    setSelectedReceipt(null);
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

export default PaymentHistory;
