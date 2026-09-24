/**
 * ─────────────────────────────────────────────
 *  Service — Audit Logging
 * ─────────────────────────────────────────────
 *  Fire-and-forget helper. All calls are wrapped
 *  so audit failures NEVER crash the main flow.
 *
 *  Usage:
 *    import { audit } from '../services/audit.service.js';
 *    await audit.log({ userId, userEmail, module, action, recordId, description });
 */

import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const audit = {
  /**
   * Write a single audit log entry.
   * Silently swallows errors so the calling service is unaffected.
   *
   * @param {object} params
   * @param {string|null}  params.userId      - ObjectId of the acting user
   * @param {string}       params.userEmail   - email of the acting user
   * @param {string}       params.module      - 'student'|'payment'|'settings'|'auth'|...
   * @param {string}       params.action      - 'create'|'update'|'delete'|'login'|'logout'|'login_failed'
   * @param {string|null}  params.recordId    - ObjectId of the affected document
   * @param {string}       params.description - human-readable summary
   * @param {object}       params.metadata    - optional extra data (stripped of passwords)
   * @param {string}       params.ipAddress   - optional IP from request
   */
  log: async ({
    userId      = null,
    userEmail   = 'system',
    module,
    action,
    recordId    = null,
    description = '',
    metadata    = {},
    ipAddress   = '',
  }) => {
    try {
      await AuditLog.create({
        userId,
        userEmail,
        module,
        action,
        recordId,
        description,
        metadata,
        ipAddress,
      });
    } catch (err) {
      // Audit failure must never block the main request
      logger.error(`[Audit] Failed to write log — ${err.message}`);
    }
  },

  /**
   * Convenience: build common description strings.
   */
  describe: {
    create:  (module, id) => `${module} created — id: ${id}`,
    update:  (module, id) => `${module} updated — id: ${id}`,
    delete:  (module, id) => `${module} deleted — id: ${id}`,
    login:   (email)      => `User login — ${email}`,
    logout:  (email)      => `User logout — ${email}`,
    loginFailed: (email)  => `Failed login attempt — ${email}`,
  },
};
