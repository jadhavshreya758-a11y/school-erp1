/**
 * ─────────────────────────────────────────────
 *  Utility — Standard API Response Helpers
 * ─────────────────────────────────────────────
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array} errors
 */
export const sendError = (res, statusCode, message, errors = []) => {
  const payload = { success: false, message };
  if (errors.length) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
