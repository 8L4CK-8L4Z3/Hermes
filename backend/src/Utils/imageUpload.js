import { uploadConfig } from "../Configs/multer.js";
import { optimizeImage, optimizationPresets } from "./imageProcessor.js";
import { ErrorResponse, SuccessResponse } from "./responses.js";
import logger from "./logger.js";
import path from "path";
import fs from "fs";

const NAMESPACE = "ImageUpload";

/**
 * Wrapper function to handle multer upload with promise
 * @param {Object} req - Express request object
 * @param {string} uploadType - Type of upload (profile, trip, place, review)
 * @returns {Promise} Promise object represents the upload operation
 */
const handleMulterUpload = (req, uploadType) => {
  return new Promise((resolve, reject) => {
    uploadConfig[uploadType](req, {}, (err) => {
      if (err) {
        logger.logError(
          NAMESPACE,
          `Multer upload failed for type: ${uploadType}`,
          err
        );
        reject(err);
      }
      logger.logInfo(
        NAMESPACE,
        `Multer upload successful for type: ${uploadType}`
      );
      resolve();
    });
  });
};

/**
 * Process single image upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} uploadType - Type of upload (profile, trip, place, review)
 */
export const uploadSingleImage = async (req, res, uploadType) => {
  try {
    await handleMulterUpload(req, uploadType);

    if (!req.file) {
      logger.logWarn(NAMESPACE, "No file provided for upload", { uploadType });
      return ErrorResponse(res, "No file uploaded", 400);
    }

    logger.logDebug(NAMESPACE, "Processing single image", {
      filename: req.file.originalname,
      uploadType,
    });

    const optimizedImage = await optimizeImage(
      req.file,
      optimizationPresets[uploadType]
    );

    if (!optimizedImage.success) {
      logger.logError(NAMESPACE, "Image optimization failed", {
        error: optimizedImage.error,
        filename: req.file.originalname,
      });
      return ErrorResponse(res, optimizedImage.error, 500);
    }

    logger.logInfo(NAMESPACE, "Single image upload successful", {
      filename: optimizedImage.filename,
      uploadType,
    });

    return SuccessResponse(res, {
      message: "File uploaded successfully",
      file: {
        filename: optimizedImage.filename,
        path: optimizedImage.path,
      },
    });
  } catch (error) {
    logger.logError(NAMESPACE, "Single image upload failed", error);
    return ErrorResponse(res, error.message, 500);
  }
};

/**
 * Process multiple images upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} uploadType - Type of upload (trip, place, review)
 */
export const uploadMultipleImages = async (req, res, uploadType) => {
  try {
    await handleMulterUpload(req, uploadType);

    if (!req.files || req.files.length === 0) {
      logger.logWarn(NAMESPACE, "No files provided for multiple upload", {
        uploadType,
      });
      return ErrorResponse(res, "No files uploaded", 400);
    }

    logger.logDebug(NAMESPACE, "Processing multiple images", {
      count: req.files.length,
      uploadType,
    });

    const optimizedImages = await Promise.all(
      req.files.map(async (file) => {
        const optimized = await optimizeImage(
          file,
          optimizationPresets[uploadType]
        );
        return optimized;
      })
    );

    const failedUploads = optimizedImages.filter((img) => !img.success);
    if (failedUploads.length > 0) {
      logger.logError(NAMESPACE, "Some images failed to process", {
        failedCount: failedUploads.length,
        totalCount: req.files.length,
        errors: failedUploads.map((img) => img.error),
      });
      return ErrorResponse(res, "Some images failed to process", 500, {
        failedUploads: failedUploads.map((img) => img.error),
      });
    }

    logger.logInfo(NAMESPACE, "Multiple images upload successful", {
      count: optimizedImages.length,
      uploadType,
    });

    return SuccessResponse(res, {
      message: "Files uploaded successfully",
      files: optimizedImages.map((img) => ({
        filename: img.filename,
        path: img.path,
      })),
    });
  } catch (error) {
    logger.logError(NAMESPACE, "Multiple images upload failed", error);
    return ErrorResponse(res, error.message, 500);
  }
};

/**
 * Delete uploaded file
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
export const deleteUploadedFile = async (filePath) => {
  try {
    if (filePath) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.logInfo(NAMESPACE, "File deleted successfully", {
          path: filePath,
        });
      } else {
        logger.logWarn(NAMESPACE, "File not found for deletion", {
          path: filePath,
        });
      }
    }
    return true;
  } catch (error) {
    logger.logError(NAMESPACE, "Error deleting file", error);
    return false;
  }
};
