import express from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, signOut } from '../controllers/authController.js';
import { validateAuth } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateAuth.register, register);
router.post('/login', validateAuth.login, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getProfile);
router.post('/logout', authenticateToken, signOut);

export default router; 