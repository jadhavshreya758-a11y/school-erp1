/**
 * ─────────────────────────────────────────────
 *  Model — Parent
 * ─────────────────────────────────────────────
 *  Represents a parent/guardian linked to one or
 *  more students in the school.
 */

import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid alternate phone number'],
      default: '',
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city:   { type: String, trim: true, default: '' },
      state:  { type: String, trim: true, default: '' },
      zip:    { type: String, trim: true, default: '' },
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
      default: '',
    },
    relation: {
      type: String,
      enum: ['father', 'mother', 'guardian', 'other'],
      default: 'guardian',
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
parentSchema.index({ email: 1 });
parentSchema.index({ phone: 1 });
parentSchema.index({ name: 'text' });
parentSchema.index({ isActive: 1 });
parentSchema.index({ deletedAt: 1 });

// ── Default query scope — exclude soft-deleted ─
parentSchema.pre(/^find/, function (next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

const Parent = mongoose.model('Parent', parentSchema);
export default Parent;
