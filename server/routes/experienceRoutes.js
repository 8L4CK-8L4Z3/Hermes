import express from 'express';
import { 
  createExperience, getExperience, updateExperience, 
  deleteExperience, getExperiences, getTripExperiences 
} from '../controllers/experienceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getExperiences);
router.get('/:id', validateObjectId('id'), getExperience);
router.get('/trip/:tripId', validateObjectId('tripId'), getTripExperiences);

// Protected routes
router.post('/',
  authenticateToken,
  upload.array('media', 10),
  processImage,
  createExperience
);
router.put('/:id',
  authenticateToken,
  validateObjectId('id'),
  upload.array('media', 10),
  processImage,
  updateExperience
);
router.delete('/:id',
  authenticateToken,
  validateObjectId('id'),
  deleteExperience
);

export default router;