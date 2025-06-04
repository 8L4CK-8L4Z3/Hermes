import { logger } from "./winston.js";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const logInfo = (namespace, message, object) => {
  logger.info(message, { namespace, object });
};

const logWarn = (namespace, message, object) => {
  logger.warn(message, { namespace, object });
};

const logError = (namespace, message, error) => {
  try {
    if (error) {
      const errorDetails = {
        message: error.message || String(error),
        stack: error.stack,
        ...(error.code && { code: error.code }),
        ...(error.name && { name: error.name }),
      };

      logger.error(message, {
        namespace,
        error: errorDetails,
      });
    } else {
      logger.error(message, { namespace });
    }
  } catch (loggingError) {
    console.error("Failed to log error:", loggingError);
    console.error("Original error:", error);
  }
};

const logDebug = (namespace, message, object) => {
  logger.debug(message, { namespace, object });
};

const getTimeStamp = () => new Date().toISOString();

export default {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
