/**
 * Centralized logging utility for the ETH Cali Wallet
 * Replaces console.log statements with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

/**
 * Format log message with timestamp and level
 */
function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

/**
 * Determine if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  switch (level) {
    case 'debug':
      return isDev && isDebugEnabled;
    case 'info':
      return isDev;
    case 'warn':
      return true; // Always show warnings
    case 'error':
      return true; // Always show errors
    default:
      return false;
  }
}

/**
 * Logger instance with environment-aware logging
 */
export const logger = {
  /**
   * Debug level logging - only shown in development with DEBUG=true
   * Use for detailed debugging information
   */
  debug: (message: string, data?: unknown): void => {
    if (shouldLog('debug')) {
      if (data !== undefined) {
        console.log(formatMessage('debug', message), data);
      } else {
        console.log(formatMessage('debug', message));
      }
    }
  },

  /**
   * Info level logging - only shown in development
   * Use for general information about app state
   */
  info: (message: string, data?: unknown): void => {
    if (shouldLog('info')) {
      if (data !== undefined) {
        console.info(formatMessage('info', message), data);
      } else {
        console.info(formatMessage('info', message));
      }
    }
  },

  /**
   * Warning level logging - always shown
   * Use for potentially problematic situations
   */
  warn: (message: string, data?: unknown): void => {
    if (shouldLog('warn')) {
      if (data !== undefined) {
        console.warn(formatMessage('warn', message), data);
      } else {
        console.warn(formatMessage('warn', message));
      }
    }
  },

  /**
   * Error level logging - always shown
   * Use for errors that need attention
   */
  error: (message: string, error?: unknown): void => {
    if (shouldLog('error')) {
      const formattedMessage = formatMessage('error', message);
      if (error !== undefined) {
        console.error(formattedMessage, error);
      } else {
        console.error(formattedMessage);
      }

      // In production, you could send errors to an error tracking service here
      // Example: sendToErrorTracking({ message, error, timestamp: new Date().toISOString() });
    }
  },

  /**
   * Log a transaction event
   */
  tx: (action: string, data: { hash?: string; chainId?: number; status?: string }): void => {
    if (shouldLog('info')) {
      console.info(formatMessage('info', `[TX] ${action}`), data);
    }
  },

  /**
   * Log a contract interaction
   */
  contract: (action: string, data: { contract?: string; method?: string; args?: unknown[] }): void => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', `[CONTRACT] ${action}`), data);
    }
  },

  /**
   * Log a wallet event
   */
  wallet: (action: string, data?: { address?: string; chainId?: number }): void => {
    if (shouldLog('info')) {
      if (data !== undefined) {
        console.info(formatMessage('info', `[WALLET] ${action}`), data);
      } else {
        console.info(formatMessage('info', `[WALLET] ${action}`));
      }
    }
  },

  /**
   * Log an API call
   */
  api: (action: string, data?: { endpoint?: string; status?: number }): void => {
    if (shouldLog('debug')) {
      if (data !== undefined) {
        console.log(formatMessage('debug', `[API] ${action}`), data);
      } else {
        console.log(formatMessage('debug', `[API] ${action}`));
      }
    }
  },

  /**
   * Create a scoped logger for a specific component
   */
  scope: (componentName: string) => ({
    debug: (message: string, data?: unknown): void => {
      logger.debug(`[${componentName}] ${message}`, data);
    },
    info: (message: string, data?: unknown): void => {
      logger.info(`[${componentName}] ${message}`, data);
    },
    warn: (message: string, data?: unknown): void => {
      logger.warn(`[${componentName}] ${message}`, data);
    },
    error: (message: string, error?: unknown): void => {
      logger.error(`[${componentName}] ${message}`, error);
    },
  }),

  /**
   * Group related log messages (dev only)
   */
  group: (label: string, fn: () => void): void => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Time an operation (dev only)
   */
  time: (label: string): (() => void) => {
    if (isDev) {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        console.log(formatMessage('debug', `[TIMING] ${label}: ${duration.toFixed(2)}ms`));
      };
    }
    return () => {};
  },
};

export default logger;
