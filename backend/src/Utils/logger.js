import { logger } from "./winston.js";

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


export default {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
