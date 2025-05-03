import express from 'express';
import { getUserProfile, updateProfile, deleteAccount, getUserTrips, getUserExperiences, getUserStatistics } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateUser, validateObjectId } from '../middleware/validate.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

// Profile routes
router.get('/:id', validateObjectId('id'), getUserProfile);
router.put('/profile', 
  authenticateToken,
  upload.single('profilePicture'),
  processImage,
  validateUser.updateProfile,
  updateProfile
);
router.delete('/account', authenticateToken, deleteAccount);

// User content routes
router.get('/:id/trips', validateObjectId('id'), getUserTrips);
router.get('/:id/experiences', validateObjectId('id'), getUserExperiences);
router.get('/:id/statistics', validateObjectId('id'), getUserStatistics);

export default router; 