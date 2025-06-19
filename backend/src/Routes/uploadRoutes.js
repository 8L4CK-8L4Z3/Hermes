import express from "express";
import { uploadImage, uploadImages } from "../Controllers/uploadController.js";
import path from "path";
import { fileURLToPath } from "url";
import { FRONTEND_URL } from "../Configs/config.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload routes
router.post("/image", uploadImage);
router.post("/images", uploadImages);

// Serve images using Express static middleware with CORS headers
router.use(
  "/",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader(
        "Access-Control-Allow-Origin",
        FRONTEND_URL || "http://localhost:5743"
      );
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache
    },
  })
);

export default router;
