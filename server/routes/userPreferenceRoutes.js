import express from 'express';
import { 
  getPreferences, setPreference, bulkSetPreferences,
  deletePreference, resetPreferences 
} from '../controllers/userPreferenceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validatePreference } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get preferences
router.get('/', getPreferences);

// Set preferences
router.put('/',
  validatePreference.set,
  setPreference
);

// Bulk set preferences
router.put('/bulk',
  validatePreference.bulk,
  bulkSetPreferences
);

// Delete preferences
router.delete('/:category',
  deletePreference
);

// Reset all preferences
router.delete('/reset',
  resetPreferences
);

export default router; 