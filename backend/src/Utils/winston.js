import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import "winston-daily-rotate-file";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");``
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const customFormat = winston.format.printf(
  ({ level, message, timestamp, namespace, error }) => {
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${namespace}] ${message}`;

    if (error) {
      logMessage += `\nError Details:\n`;
      if (error.message) logMessage += `Message: ${error.message}\n`;
      if (error.code) logMessage += `Code: ${error.code}\n`;
      if (error.name) logMessage += `Name: ${error.name}\n`;
      if (error.stack) logMessage += `Stack: ${error.stack}\n`;
    }

    return logMessage;
  }
);

const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, namespace, error }) => {
    const levelColors = {
      error: colors.red,
      warn: colors.yellow,
      info: colors.green,
      debug: colors.magenta,
    };

    const color = levelColors[level] || colors.reset;
    const namespaceColor = colors.cyan;

    let logMessage = `[${timestamp}] ${color}[${level.toUpperCase()}]${
      colors.reset
    } [${namespaceColor}${namespace}${colors.reset}] ${message}`;

    if (error) {
      logMessage += `\n${colors.red}Error Details:${colors.reset}\n`;
      if (error.message)
        logMessage += `${colors.red}Message: ${error.message}${colors.reset}\n`;
      if (error.code)
        logMessage += `${colors.red}Code: ${error.code}${colors.reset}\n`;
      if (error.name)
        logMessage += `${colors.red}Name: ${error.name}${colors.reset}\n`;
      if (error.stack)
        logMessage += `${colors.red}Stack: ${error.stack}${colors.reset}\n`;
    }

    return logMessage;
  }
);

// Create daily rotate file transport
const createDailyRotateTransport = (filename, level) => {
  return new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, `${filename}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.metadata({
        fillExcept: ["message", "level", "timestamp", "namespace", "error"],
      }),
      customFormat
    ),
    handleExceptions: true,
    handleRejections: true,
  });
};

// Create the logger instance
export const logger = winston.createLogger({
  level: "info",
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata({
      fillExcept: ["message", "level", "timestamp", "namespace", "error"],
    }),
    customFormat
  ),
  transports: [
    createDailyRotateTransport("error", "error"),
    createDailyRotateTransport("combined", "info"),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp", "namespace", "error"],
        }),
        consoleFormat
      ),
    }),
  ],
});

// Handle uncaught exceptions and rejections
logger.on("error", (error) => {
  console.error("Winston logger error:", error);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    namespace: "Process",
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    namespace: "Process",
    error: {
      message: reason.message || reason,
      stack: reason.stack,
      name: reason.name,
    },
  });
});
