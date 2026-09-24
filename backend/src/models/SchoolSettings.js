/**
 * ─────────────────────────────────────────────
 *  Model — SchoolSettings
 * ─────────────────────────────────────────────
 *  Single-document collection. Only one settings
 *  record ever exists — enforced by a fixed
 *  singleton key. Use findOneAndUpdate with upsert.
 */

import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema(
  {
    // Fixed key so only one document can exist
    _singleton: {
      type:    String,
      default: 'school_settings',
      unique:  true,
      immutable: true,
    },

    // ── School Identity ───────────────────────
    schoolName: {
      type:      String,
      required:  [true, 'School name is required'],
      trim:      true,
      maxlength: [200, 'School name cannot exceed 200 characters'],
    },
    schoolCode: {
      type:      String,
      trim:      true,
      uppercase: true,
      maxlength: [50, 'School code cannot exceed 50 characters'],
      default:   '',
    },
    tagline: {
      type:      String,
      trim:      true,
      maxlength: [300, 'Tagline cannot exceed 300 characters'],
      default:   '',
    },
    logoUrl: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Contact ───────────────────────────────
    email: {
      type:  String,
      trim:  true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      default: '',
    },
    phone: {
      type:  String,
      trim:  true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
      default: '',
    },
    website: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Address ───────────────────────────────
    address: {
      street:  { type: String, trim: true, default: '' },
      city:    { type: String, trim: true, default: '' },
      state:   { type: String, trim: true, default: '' },
      zip:     { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
    },

    // ── Academic ──────────────────────────────
    currentAcademicYear: {
      type:  String,
      trim:  true,
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
      default: '',
    },
    currency: {
      type:    String,
      trim:    true,
      default: 'INR',
    },
    timezone: {
      type:    String,
      trim:    true,
      default: 'Asia/Kolkata',
    },
  },
  {
    timestamps: true,
  },
);

const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);
export default SchoolSettings;
