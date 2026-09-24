/**
 * ─────────────────────────────────────────────
 *  Model — Fee
 * ─────────────────────────────────────────────
 *  Defines the annual fee structure for a class
 *  in a given academic year.
 *  Business rule: one fee record per class per
 *  academic year (enforced via compound unique index).
 */

import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g. 2024-2025)'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total fee amount is required'],
      min: [0, 'Fee amount cannot be negative'],
    },
    breakdown: {
      tuition:      { type: Number, default: 0, min: 0 },
      transport:    { type: Number, default: 0, min: 0 },
      library:      { type: Number, default: 0, min: 0 },
      laboratory:   { type: Number, default: 0, min: 0 },
      sports:       { type: Number, default: 0, min: 0 },
      miscellaneous:{ type: Number, default: 0, min: 0 },
    },
    dueDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Soft-delete
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────
// Core business rule: one fee structure per class per academic year
feeSchema.index({ classId: 1, academicYear: 1 }, { unique: true });
feeSchema.index({ academicYear: 1 });
feeSchema.index({ isActive: 1 });
feeSchema.index({ deletedAt: 1 });

// ── Default query scope — exclude soft-deleted ─
feeSchema.pre(/^find/, function (next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
