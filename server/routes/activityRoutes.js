import express from 'express';
import { 
  createActivity, getActivity, updateActivity,
  deleteActivity, getActivities, approveActivity 
} from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getActivities);
router.get('/:id', validateObjectId('id'), getActivity);

// Protected routes
router.post('/',
  authenticateToken,
  upload.single('image'),
  processImage,
  createActivity
);

// Admin routes
router.put('/:id',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  upload.single('image'),
  processImage,
  updateActivity
);
router.delete('/:id',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  deleteActivity
);
router.put('/:id/approve',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  approveActivity
);

export default router; 