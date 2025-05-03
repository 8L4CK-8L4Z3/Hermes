import express from 'express';
import {
  createReport, getReport, updateReportStatus,
  deleteReport, getReports, getReportStats
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User routes
router.post('/',
  validateObjectId('target_id'),
  createReport
);

router.get('/my',
  validatePagination,
  getReports
);

// Admin routes
router.get('/',
  authorizeAdmin,
  validatePagination,
  getReports
);

router.get('/stats',
  authorizeAdmin,
  getReportStats
);

router.get('/:id',
  authorizeAdmin,
  validateObjectId('id'),
  getReport
);

router.put('/:id/status',
  authorizeAdmin,
  validateObjectId('id'),
  updateReportStatus
);

router.delete('/:id',
  authorizeAdmin,
  validateObjectId('id'),
  deleteReport
);

export default router; 