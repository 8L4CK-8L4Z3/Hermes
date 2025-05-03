import express from 'express';
import { createDestination, getDestination, updateDestination, deleteDestination, getDestinations, approveDestination } from '../controllers/destinationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';
import { upload, processImage } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', validatePagination, getDestinations);
router.get('/:id', validateObjectId('id'), getDestination);

// Protected routes
router.post('/',
  authenticateToken,
  upload.single('image'),
  processImage,
  createDestination
);

// Admin routes
router.put('/:id',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  upload.single('image'),
  processImage,
  updateDestination
);

router.delete('/:id',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  deleteDestination
);

router.put('/:id/approve',
  authenticateToken,
  authorizeAdmin,
  validateObjectId('id'),
  approveDestination
);

export default router; 