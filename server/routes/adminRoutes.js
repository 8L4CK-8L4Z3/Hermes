import express from 'express';
import {
  getDashboardStats,
  getSystemHealth,
  getErrorLogs,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getUserActions,
  getPendingApprovals,
  processApproval,
  processBulkApprovals,
  getSystemLogs,
  getSystemMetrics,
  getApiUsage,
  getDatabaseHealth
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication and admin authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/health', getSystemHealth);
router.get('/dashboard/errors', validatePagination, getErrorLogs);

// User management routes
router.get('/users', validatePagination, getAllUsers);
router.get('/users/:userId', validateObjectId('userId'), getUserDetails);
router.put('/users/:userId/status', validateObjectId('userId'), updateUserStatus);
router.get('/users/:userId/actions', validateObjectId('userId'), validatePagination, getUserActions);

// Content approval routes
router.get('/approvals', validatePagination, getPendingApprovals);
router.put('/approvals/:id', validateObjectId('id'), processApproval);
router.post('/approvals/bulk', processBulkApprovals);

// System management routes
router.get('/system/logs', validatePagination, getSystemLogs);
router.get('/system/metrics', getSystemMetrics);
router.get('/system/api-usage', getApiUsage);
router.get('/system/db-health', getDatabaseHealth);

export default router; 