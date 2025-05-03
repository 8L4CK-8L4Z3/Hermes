import express from 'express';
import { createTrip, getTrip, updateTrip, deleteTrip, getTrips, updateTripVisibility, getItinerary } from '../controllers/tripController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = express.Router();

// Trip CRUD operations
router.post('/', authenticateToken, createTrip);
router.get('/', validatePagination, getTrips);
router.get('/:id', validateObjectId('id'), getTrip);
router.put('/:id', authenticateToken, validateObjectId('id'), updateTrip);
router.delete('/:id', authenticateToken, validateObjectId('id'), deleteTrip);

// Trip visibility
router.put('/:id/visibility', 
  authenticateToken,
  validateObjectId('id'),
  updateTripVisibility
);

// Trip itinerary
router.get('/:id/itinerary',
  validateObjectId('id'),
  getItinerary
);

export default router; 