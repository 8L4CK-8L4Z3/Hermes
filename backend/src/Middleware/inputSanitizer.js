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
 * @param {WeakSet} [seen=new WeakSet()] - Used to detect circular references
 * @returns {*} - Sanitized data
 */
const sanitizeData = (data, seen = new WeakSet()) => {
  // Return early if data is not an object or is null
  if (typeof data !== "object" || data === null) {
    if (typeof data === "string") {
      return xss(data);
    }
    return data;
  }

  // Return date objects without sanitizing properties.
  if (data instanceof Date) {
    return data;
  }

  // If we have seen this object before, it's a circular reference.
  if (seen.has(data)) {
    // Return the data as-is to break the circular reference.
    return data;
  }

  // Add the object to the set of seen objects.
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, seen));
  }

  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    sanitizedData[key] = sanitizeData(value, seen);
  }
  return sanitizedData;
};

export { sanitizeInput, sanitizeData };
