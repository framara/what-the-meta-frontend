/**
 * Logger utility that respects development/debug settings
 * 
 * In production, only console.warn and console.error are output.
 * In development or with VITE_DEBUG=true, all logs are output.
 */

const isDev = import.meta.env.DEV;
const isDebug = import.meta.env.VITE_DEBUG === 'true';

// Check at runtime if we should log
const shouldLog = isDev || isDebug;

export const logger = {
  /**
   * Log general information (dev/debug only)
   */
  log: (...args: any[]): void => {
    if (shouldLog) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages (dev/debug only)
   */
  info: (...args: any[]): void => {
    if (shouldLog) {
      console.info(...args);
    }
  },

  /**
   * Log debug messages (dev/debug only)
   */
  debug: (...args: any[]): void => {
    if (shouldLog) {
      console.debug(...args);
    }
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args: any[]): void => {
    console.warn(...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args: any[]): void => {
    console.error(...args);
  },
};
