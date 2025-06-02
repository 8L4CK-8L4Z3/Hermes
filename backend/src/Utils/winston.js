import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  exitOnError: false,
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
  ],
});
