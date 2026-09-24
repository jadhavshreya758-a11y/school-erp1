/**
 * ─────────────────────────────────────────────
 *  Model — Class
 * ─────────────────────────────────────────────
 *  Represents a class/grade/section in the school.
 *  e.g. "Grade 1 – Section A"
 */

import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      minlength: [1, 'Class name cannot be empty'],
      maxlength: [100, 'Class name cannot exceed 100 characters'],
    },
    section: {
      type: String,
      trim: true,
      maxlength: [20, 'Section cannot exceed 20 characters'],
      default: '',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY (e.g. 2024-2025)'],
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      max: [200, 'Capacity cannot exceed 200'],
      default: 40,
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
classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });
classSchema.index({ academicYear: 1 });
classSchema.index({ isActive: 1 });
classSchema.index({ deletedAt: 1 });

// ── Virtual — full display name ───────────────
classSchema.virtual('displayName').get(function () {
  return this.section ? `${this.name} – ${this.section}` : this.name;
});

// ── Default query scope — exclude soft-deleted ─
classSchema.pre(/^find/, function (next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

const Class = mongoose.model('Class', classSchema);
export default Class;
