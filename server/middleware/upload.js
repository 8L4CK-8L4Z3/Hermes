import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Image processing middleware
export const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const processedFilename = 'processed-' + req.file.filename;
    const processedPath = path.join(req.file.destination, processedFilename);

    await sharp(req.file.path)
      .resize(800, 800, { // Max dimensions
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(req.file.path);

    // Update req.file with processed file info
    req.file.filename = processedFilename;
    req.file.path = processedPath;

    next();
  } catch (error) {
    next(error);
  }
}; 