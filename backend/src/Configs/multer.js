import multer from "multer";
import path from "path";
import fs from "fs";

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    "uploads",
    "uploads/profiles",
    "uploads/trips",
    "uploads/places",
    "uploads/reviews",
    "uploads/activities",
    "uploads/destinations",
  ];

  dirs.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on file type
    let uploadDir = "uploads";

    if (file.fieldname === "profile") {
      uploadDir = "uploads/profiles";
    } else if (file.fieldname === "trip") {
      uploadDir = "uploads/trips";
    } else if (file.fieldname === "place") {
      uploadDir = "uploads/places";
    } else if (file.fieldname === "review") {
      uploadDir = "uploads/reviews";
    } else if (file.fieldname === "activity") {
      uploadDir = "uploads/activities";
    } else if (file.fieldname === "destination") {
      uploadDir = "uploads/destinations";
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Export multer configurations for different upload types
export const uploadConfig = {
  profile: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }).single("profile"),

  trip: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }).array("trip", 10), // Max 10 images per trip

  place: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }).array("place", 5), // Max 5 images per place

  review: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }).array("review", 5), // Max 5 images per review

  activity: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }).array("activity", 5), // Max 5 images per activity

  destination: multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }).array("destination", 10), // Max 10 images per destination
};
