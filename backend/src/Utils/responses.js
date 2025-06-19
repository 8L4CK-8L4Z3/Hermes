const formatResponse = ({
  success,
  code,
  message,
  data = null,
  meta = {},
  error = null,
}) => {
  const response = {
    success,
    ...(message && { message }),
    ...(data && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return response;
};

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.code - HTTP status code (default: 200)
 * @param {string} options.message - Success message
 * @param {any} [options.data] - Response data
 * @param {Object} [options.meta] - Additional metadata
 * @returns {Object} Express response
 */
export const successResponse = (
  res,
  { code = 200, message, data, meta = {} }
) => {
  const response = formatResponse({
    success: true,
    code,
    message,
    data,
    meta,
  });

  return res.status(code).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {number} options.code - HTTP status code
 * @param {string} options.message - Error message
 * @param {Object} [options.error] - Additional error details
 * @param {Object} [options.meta] - Additional metadata
 * @returns {Object} Express response
 */
export const errorResponse = (
  res,
  { code, message, error = null, meta = {}, errors = null }
) => {
  // Add timestamp to meta if not present
  if (!meta.timestamp) {
    meta.timestamp = new Date().toISOString();
  }

  // In development, include full error details
  const errorDetails =
    process.env.NODE_ENV === "development"
      ? {
          code: code.toString(),
          message: error?.message || message,
          details: error || {},
          ...(errors && { errors }),
          stack: error?.stack,
        }
      : {
          code: code.toString(),
          message: message,
          ...(errors && { errors }),
        };

  const response = {
    success: false,
    message,
    error: errorDetails,
    meta,
  };

  return res.status(code).json(response);
};

/**
 * Format paginated response data
 * @param {Array} data - Array of items
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total number of items
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, { page, limit, total }) => {
  return formatResponse({
    success: true,
    code: 200,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * Format single item response
 * @param {any} data - Response data
 * @param {Object} [meta] - Additional metadata
 * @returns {Object} Formatted single item response
 */
export const singleItemResponse = (data, meta = {}) => {
  return formatResponse({
    success: true,
    code: 200,
    data,
    meta,
  });
};

/**
 * Format collection response
 * @param {Array} data - Array of items
 * @param {Object} [meta] - Additional metadata
 * @returns {Object} Formatted collection response
 */
export const collectionResponse = (data, meta = {}) => {
  return formatResponse({
    success: true,
    code: 200,
    data,
    meta,
  });
};

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  CONFLICT: "Resource conflict",
};

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  RETRIEVED: "Resource retrieved successfully",
};

/**
 * Common success response patterns for controllers
 */
export const successPatterns = {
  /**
   * Send a created response (201)
   */
  created: (res, { data, message = SUCCESS_MESSAGES.CREATED, meta = {} }) => {
    return successResponse(res, {
      code: HTTP_STATUS.CREATED,
      message,
      data,
      meta,
    });
  },

  /**
   * Send an updated response (200)
   */
  updated: (res, { data, message = SUCCESS_MESSAGES.UPDATED, meta = {} }) => {
    return successResponse(res, {
      code: HTTP_STATUS.OK,
      message,
      data,
      meta,
    });
  },

  /**
   * Send a deleted response (200)
   */
  deleted: (res, { message = SUCCESS_MESSAGES.DELETED, meta = {} }) => {
    return successResponse(res, {
      code: HTTP_STATUS.OK,
      message,
      meta,
    });
  },

  /**
   * Send a retrieved response (200)
   */
  retrieved: (
    res,
    { data, message = SUCCESS_MESSAGES.RETRIEVED, meta = {} }
  ) => {
    return successResponse(res, {
      code: HTTP_STATUS.OK,
      message,
      data,
      meta,
    });
  },
};

/**
 * Common error response patterns for controllers
 */
export const errorPatterns = {
  /**
   * Send a not found response (404)
   */
  notFound: (
    res,
    { message = ERROR_MESSAGES.NOT_FOUND, error = null, meta = {} }
  ) => {
    return errorResponse(res, {
      code: HTTP_STATUS.NOT_FOUND,
      message,
      error,
      meta,
    });
  },

  /**
   * Send an unauthorized response (401)
   */
  unauthorized: (
    res,
    { message = ERROR_MESSAGES.UNAUTHORIZED, error = null, meta = {} }
  ) => {
    return errorResponse(res, {
      code: HTTP_STATUS.UNAUTHORIZED,
      message,
      error,
      meta,
    });
  },

  /**
   * Send a forbidden response (403)
   */
  forbidden: (
    res,
    { message = ERROR_MESSAGES.FORBIDDEN, error = null, meta = {} }
  ) => {
    return errorResponse(res, {
      code: HTTP_STATUS.FORBIDDEN,
      message,
      error,
      meta,
    });
  },

  /**
   * Send a validation error response (422)
   */
  validationError: (
    res,
    { message = ERROR_MESSAGES.VALIDATION_ERROR, error = null, meta = {} }
  ) => {
    return errorResponse(res, {
      code: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message,
      error,
      meta,
    });
  },

  /**
   * Send an internal server error response (500)
   */
  internal: (
    res,
    { message = ERROR_MESSAGES.INTERNAL_ERROR, error = null, meta = {} }
  ) => {
    return errorResponse(res, {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      error,
      meta,
    });
  },
};

/**
 * Response middleware for async controller functions
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the full error
      console.error("Unhandled error in async handler:", error);

      return errorPatterns.internal(res, {
        message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
        error: error,
      });
    });
  };
};

/**
 * Example usage in a controller:
 *
 * import { successPatterns, errorPatterns, asyncHandler } from '../utils/responses';
 *
 * export const createUser = asyncHandler(async (req, res) => {
 *   const user = await User.create(req.body);
 *   return successPatterns.created(res, { data: user });
 * });
 *
 * export const getUser = asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   if (!user) {
 *     return errorPatterns.notFound(res, { error: { id: req.params.id } });
 *   }
 *   return successPatterns.retrieved(res, { data: user });
 * });
 *
 * export const updateUser = asyncHandler(async (req, res) => {
 *   const user = await User.findByIdAndUpdate(
 *     req.params.id,
 *     req.body,
 *     { new: true }
 *   );
 *   if (!user) {
 *     return errorPatterns.notFound(res, { error: { id: req.params.id } });
 *   }
 *   return successPatterns.updated(res, { data: user });
 * });
 *
 * export const deleteUser = asyncHandler(async (req, res) => {
 *   const user = await User.findByIdAndDelete(req.params.id);
 *   if (!user) {
 *     return errorPatterns.notFound(res, { error: { id: req.params.id } });
 *   }
 *   return successPatterns.deleted(res);
 * });
 */
