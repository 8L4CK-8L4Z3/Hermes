import xss from "xss";

/**
 * Global middleware for sanitizing user input to prevent XSS attacks
 * This middleware sanitizes:
 * - req.body
 * - req.query
 * - req.params
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sanitizeInput = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeData(req.body);
    }

    if (req.query) {
      req.query = sanitizeData(req.query);
    }

    if (req.params) {
      req.params = sanitizeData(req.params);
    }

    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid input data",
    });
  }
};

/**
 * Recursively sanitizes data objects
 * @param {*} data - Data to sanitize
 * @returns {*} - Sanitized data
 */
const sanitizeData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (data instanceof Object && !(data instanceof Date)) {
    const sanitizedData = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = sanitizeData(value);
    }
    return sanitizedData;
  }

  // If the value is a string, sanitize it
  if (typeof data === "string") {
    return xss(data);
  }

  // Return unchanged if not a string, array, or object
  return data;
};

export { sanitizeInput, sanitizeData };
