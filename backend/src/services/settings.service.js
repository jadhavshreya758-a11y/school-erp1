/**
 * ─────────────────────────────────────────────
 *  Service — School Settings
 * ─────────────────────────────────────────────
 */

import { settingsRepository } from '../repositories/settings.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { audit } from './audit.service.js';

export const settingsService = {
  get: async () => {
    const settings = await settingsRepository.get();
    if (!settings) {
      // Auto-seed defaults if document doesn't exist
      await settingsRepository.seedDefaults();
      return settingsRepository.get();
    }
    return settings;
  },

  update: async (body, userId = null, userEmail = 'system') => {
    // Protect the immutable singleton key from ever being overwritten
    delete body._singleton;
    const updated = await settingsRepository.upsert(body);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update school settings');
    }

    await audit.log({
      userId, userEmail,
      module:      'settings',
      action:      'update',
      description: 'School settings updated',
    });

    return updated;
  },
};
