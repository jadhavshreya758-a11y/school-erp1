/**
 * ─────────────────────────────────────────────
 *  Model — AuditLog
 * ─────────────────────────────────────────────
 *  Immutable append-only log. No updates, no
 *  deletes — records are written once and kept.
 *
 *  Modules tracked: student, payment, settings, auth
 *  Actions tracked: create, update, delete, login, logout
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system-generated entries
    },
    userEmail: {
      type: String,
      trim: true,
      default: 'system',
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      enum: ['student', 'payment', 'settings', 'auth', 'class', 'parent', 'attendance', 'fee'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['create', 'update', 'delete', 'login', 'logout', 'login_failed'],
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ recordId: 1 });
auditLogSchema.index({ createdAt: -1 });

// ── Prevent updates and deletes on this model ─
auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('AuditLog records are immutable');
});
auditLogSchema.pre('updateOne', function () {
  throw new Error('AuditLog records are immutable');
});
auditLogSchema.pre('updateMany', function () {
  throw new Error('AuditLog records are immutable');
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
