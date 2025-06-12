import { uploadConfig } from "../Configs/multer.js";
import { asyncHandler } from "../Utils/responses.js";
import logger from "../Utils/logger.js";
import path from "path";
import fs from "fs";

const NAMESPACE = "UploadController";

/**
 * Upload a single image
 * @route POST /api/upload/image
 * @access Public
 */
export const uploadImage = asyncHandler(async (req, res) => {
  uploadConfig.profile(req, res, (err) => {
    if (err) {
      logger.logError(NAMESPACE, "Error uploading image", err);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Return the file path relative to the uploads directory
    const filePath = req.file.path.split("uploads/")[1].replace(/\\/g, "/");
    return res.status(200).json({
      success: true,
      data: {
        path: filePath,
      },
    });
  });
});

/**
 * Get image by path
 * @route GET /api/upload/image/:path
 * @access Public
 */
export const getImage = asyncHandler(async (req, res) => {
  try {
    const imagePath = req.params.path;

    // Prevent directory traversal
    const normalizedPath = path
      .normalize(imagePath)
      .replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(process.cwd(), "uploads", normalizedPath);

    // Ensure the path is within the uploads directory
    const relativePath = path.relative(
      path.join(process.cwd(), "uploads"),
      fullPath
    );
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Set cache headers
    res.set({
      "Cache-Control": "public, max-age=31536000", // 1 year
      Expires: new Date(Date.now() + 31536000000).toUTCString(),
    });

    // Send the file
    res.sendFile(fullPath);
  } catch (error) {
    logger.logError(NAMESPACE, "Error serving image", error);
    return res.status(500).json({
      success: false,
      message: "Error serving image",
    });
  }
});
