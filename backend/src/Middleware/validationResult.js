import { validationResult } from "express-validator";
import { errorResponse } from "../Utils/responses.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, {
      code: 400,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

export default handleValidationErrors;
