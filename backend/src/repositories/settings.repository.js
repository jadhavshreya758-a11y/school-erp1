/**
 * ─────────────────────────────────────────────
 *  Repository — School Settings
 * ─────────────────────────────────────────────
 *  Singleton document pattern: always upsert on
 *  the fixed `_singleton` key.
 */

import SchoolSettings from '../models/SchoolSettings.js';

const SINGLETON_KEY = 'school_settings';

export const settingsRepository = {
  /**
   * Fetch the single settings document.
   * Returns null if not yet seeded.
   */
  get: () =>
    SchoolSettings.findOne({ _singleton: SINGLETON_KEY }).lean(),

  /**
   * Create or update the settings document.
   * Safe to call on first run (upsert).
   */
  upsert: (data) =>
    SchoolSettings.findOneAndUpdate(
      { _singleton: SINGLETON_KEY },
      { $set: data },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean(),

  /**
   * Seed default settings (called at server startup
   * if no settings document exists yet).
   */
  seedDefaults: async () => {
    const existing = await SchoolSettings.exists({ _singleton: SINGLETON_KEY });
    if (!existing) {
      await SchoolSettings.create({
        schoolName:          'My School',
        currentAcademicYear: '',
        currency:            'INR',
        timezone:            'Asia/Kolkata',
      });
    }
  },
};
