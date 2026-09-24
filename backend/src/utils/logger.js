/**
 * ─────────────────────────────────────────────
 *  Utility — Logger
 * ─────────────────────────────────────────────
 *  Lightweight console logger with log levels.
 *  In production only warn/error are emitted.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = process.env.NODE_ENV === 'production' ? LEVELS.warn : LEVELS.debug;

const fmt = (level, msg) => `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}`;

export const logger = {
  debug: (msg) => currentLevel <= LEVELS.debug && console.debug(fmt('debug', msg)),
  info:  (msg) => currentLevel <= LEVELS.info  && console.info(fmt('info',  msg)),
  warn:  (msg) => currentLevel <= LEVELS.warn  && console.warn(fmt('warn',  msg)),
  error: (msg) => currentLevel <= LEVELS.error && console.error(fmt('error', msg)),
};

export default logger;
