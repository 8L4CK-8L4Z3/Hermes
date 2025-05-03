import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error
  logger.error(`Error ${statusCode}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: err.message
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Authentication error',
      error: err.message
    });
  }

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞'
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}; 