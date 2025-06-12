import express from "express";
import { uploadImage, getImage } from "../Controllers/uploadController.js";

const router = express.Router();

// Upload routes
router.post("/image", uploadImage);

// Use a more specific pattern for image paths
router.get(
  "/image/:filename(*)",
  (req, res, next) => {
    // Sanitize the filename to prevent directory traversal
    const filename = req.params.filename.replace(/\.\./g, "");
    req.params.path = filename;
    next();
  },
  getImage
);

export default router;
