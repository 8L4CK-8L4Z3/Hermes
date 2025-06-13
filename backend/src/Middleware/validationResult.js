import { validationResult } from "express-validator";
import { errorResponse, HTTP_STATUS } from "../Utils/responses.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, {
      code: HTTP_STATUS.BAD_REQUEST,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export default handleValidationErrors;
