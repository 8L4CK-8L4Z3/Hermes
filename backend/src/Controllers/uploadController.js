import { uploadConfig } from "../Configs/multer.js";
import { asyncHandler } from "../Utils/responses.js";
import logger from "../Utils/logger.js";

const NAMESPACE = "UploadController";

/**
 * Upload a single image
 * @route POST /api/upload/image
 * @access Public
 */
export const uploadImage = asyncHandler(async (req, res) => {
  const type = req.query.type || "profile";

  if (!uploadConfig[type]) {
    return res.status(400).json({
      success: false,
      message: "Invalid upload type",
    });
  }

  uploadConfig[type](req, res, (err) => {
    if (err) {
      logger.logError(NAMESPACE, "Error uploading image", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Handle single file upload
    if (req.file) {
      const filePath = req.file.path.split("uploads/")[1].replace(/\\/g, "/");
      return res.status(200).json({
        success: true,
        data: {
          path: filePath,
        },
      });
    }

    // Handle multiple files upload
    const filePaths = req.files.map((file) =>
      file.path.split("uploads/")[1].replace(/\\/g, "/")
    );

    return res.status(200).json({
      success: true,
      data: {
        paths: filePaths,
      },
    });
  });
});

/**
 * Upload multiple images
 * @route POST /api/upload/images
 * @access Public
 */
export const uploadImages = asyncHandler(async (req, res) => {
  const type = req.query.type;

  if (!uploadConfig[type]) {
    return res.status(400).json({
      success: false,
      message: "Invalid upload type",
    });
  }

  uploadConfig[type](req, res, (err) => {
    if (err) {
      logger.logError(NAMESPACE, "Error uploading images", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const filePaths = req.files.map((file) =>
      file.path.split("uploads/")[1].replace(/\\/g, "/")
    );

    return res.status(200).json({
      success: true,
      data: {
        paths: filePaths,
      },
    });
  });
});
