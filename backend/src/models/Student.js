/**
 * ─────────────────────────────────────────────
 *  Model — Student
 * ─────────────────────────────────────────────
 *  Core entity of the SchoolERP system. A student
 *  belongs to one Class and one Parent/Guardian.
 */

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9\-]+$/, 'Student ID may only contain letters, numbers and hyphens'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name cannot be empty'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name cannot be empty'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
      default: Date.now,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent/Guardian is required'],
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city:   { type: String, trim: true, default: '' },
      state:  { type: String, trim: true, default: '' },
      zip:    { type: String, trim: true, default: '' },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred', 'graduated'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
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
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ classId: 1 });
studentSchema.index({ parentId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ deletedAt: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', studentId: 'text' });

// ── Virtual — full name ───────────────────────
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Default query scope — exclude soft-deleted ─
studentSchema.pre(/^find/, function (next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
