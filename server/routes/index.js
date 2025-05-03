import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import tripRoutes from './tripRoutes.js';
import experienceRoutes from './experienceRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import activityRoutes from './activityRoutes.js';
import socialRoutes from './socialRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import reportRoutes from './reportRoutes.js';
import userPreferenceRoutes from './userPreferenceRoutes.js';
import adminRoutes from './adminRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import commentRoutes from './commentRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/experiences', experienceRoutes);
router.use('/destinations', destinationRoutes);
router.use('/activities', activityRoutes);
router.use('/social', socialRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/preferences', userPreferenceRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/comments', commentRoutes);

export default router; 