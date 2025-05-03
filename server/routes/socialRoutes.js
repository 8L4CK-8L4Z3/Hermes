import express from 'express';
import {
  addComment, updateComment, deleteComment, getComments, getReplies,
  toggleLike, sendFriendRequest, respondToFriendRequest, getFriends,
  getPendingFriendRequests
} from '../controllers/socialController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validate.js';

const router = express.Router();

// Comment routes
router.post('/comments',
  authenticateToken,
  addComment
);
router.put('/comments/:id',
  authenticateToken,
  validateObjectId('id'),
  updateComment
);
router.delete('/comments/:id',
  authenticateToken,
  validateObjectId('id'),
  deleteComment
);
router.get('/experiences/:experienceId/comments',
  validateObjectId('experienceId'),
  validatePagination,
  getComments
);
router.get('/comments/:commentId/replies',
  validateObjectId('commentId'),
  validatePagination,
  getReplies
);

// Like routes
router.post('/experiences/:experienceId/like',
  authenticateToken,
  validateObjectId('experienceId'),
  toggleLike
);

// Friendship routes
router.post('/friends/request/:userId',
  authenticateToken,
  validateObjectId('userId'),
  sendFriendRequest
);
router.put('/friends/request/:friendshipId',
  authenticateToken,
  validateObjectId('friendshipId'),
  respondToFriendRequest
);
router.get('/friends',
  authenticateToken,
  validatePagination,
  getFriends
);
router.get('/friends/pending',
  authenticateToken,
  validatePagination,
  getPendingFriendRequests
);

export default router; 