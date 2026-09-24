/**
 * ─────────────────────────────────────────────
 *  Model — Attendance
 * ─────────────────────────────────────────────
 *  One record per student per calendar date.
 *  Compound unique index enforces the business
 *  rule: no duplicate attendance for the same
 *  student on the same day.
 */

import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../constants/index.js';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, 'Attendance status is required'],
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
// Core business rule: one record per student per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
