/**
 * ─────────────────────────────────────────────
 *  Model — Payment
 * ─────────────────────────────────────────────
 *  Records a fee payment made by a student.
 *  receipt number is auto-generated and unique.
 *  Business rules enforced at service layer:
 *   - Cannot exceed total fee amount (no overpayment)
 *   - Must reference an existing Fee structure
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fee',
      required: [true, 'Fee structure is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Amount paid is required'],
      min: [1, 'Amount paid must be greater than 0'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'online', 'other'],
      default: 'cash',
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by user is required'],
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────
paymentSchema.index({ receiptNumber: 1 }, { unique: true });
paymentSchema.index({ studentId: 1, academicYear: 1 });
paymentSchema.index({ feeId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ academicYear: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
