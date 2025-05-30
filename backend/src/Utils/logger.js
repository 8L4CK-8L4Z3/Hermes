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
  const coloredMessage = `${colors.green}[INFO]${colors.reset}`;
  if (object) {
    console.info(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`,
      object
    );
  } else {
    console.info(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`
    );
  }
};

const logWarn = (namespace, message, object) => {
  const coloredMessage = `${colors.yellow}[WARN]${colors.reset}`;
  if (object) {
    console.warn(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`,
      object
    );
  } else {
    console.warn(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`
    );
  }
};

const logError = (namespace, message, object) => {
  const coloredMessage = `${colors.red}[ERROR]${colors.reset}`;
  if (object) {
    let msg = JSON.stringify(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message} [ERROR DETAILS] ${JSON.stringify(object)}`
    );
    logger.error(msg);
    console.error(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`,
      object
    );
  } else {
    console.error(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`
    );
  }
};

const logDebug = (namespace, message, object) => {
  const coloredMessage = `${colors.magenta}[DEBUG]${colors.reset}`;
  if (object) {
    console.debug(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`,
      object
    );
  } else {
    console.debug(
      `[${getTimeStamp()}] ${coloredMessage} [${colors.cyan}${namespace}${
        colors.reset
      }] ${message}`
    );
  }
};

const getTimeStamp = () => new Date().toISOString();

export default {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
