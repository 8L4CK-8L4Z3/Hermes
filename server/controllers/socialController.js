import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Friendship from '../models/Friendship.js';
import Experience from '../models/Experience.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// Comment functions
export const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { experience_id, content, parent_id } = req.body;

    // Verify experience exists and is accessible
    const experience = await Experience.findOne({
      _id: experience_id,
      $or: [{ is_public: true }, { user_id: req.user.id }]
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or not accessible' });
    }

    // If it's a reply, verify parent comment exists
    if (parent_id) {
      const parentComment = await Comment.findById(parent_id);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      user_id: req.user.id,
      experience_id,
      content,
      parent_id
    });

    // Update comment count
    await Experience.findByIdAndUpdate(experience_id, {
      $inc: { comment_count: 1 }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user_id', 'username profile_picture');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, user_id: req.user.id },
      { $set: { content } },
      { new: true, runValidators: true }
    ).populate('user_id', 'username profile_picture');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user_id: req.user.id
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Update comment count
    await Experience.findByIdAndUpdate(comment.experience_id, {
      $inc: { comment_count: -1 }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { experience_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({
      experience_id,
      parent_id: null // Get only top-level comments
    })
      .populate('user_id', 'username profile_picture')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Comment.countDocuments({
      experience_id,
      parent_id: null
    });

    res.json({
      comments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const replies = await Comment.find({ parent_id: commentId })
      .populate('user_id', 'username profile_picture')
      .sort({ created_at: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Comment.countDocuments({ parent_id: commentId });

    res.json({
      replies,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like functions
export const toggleLike = async (req, res) => {
  try {
    const { experience_id } = req.params;

    // Verify experience exists and is accessible
    const experience = await Experience.findOne({
      _id: experience_id,
      $or: [{ is_public: true }, { user_id: req.user.id }]
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience not found or not accessible' });
    }

    const existingLike = await Like.findOne({
      user_id: req.user.id,
      experience_id
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Experience.findByIdAndUpdate(experience_id, {
        $inc: { like_count: -1 }
      });
      res.json({ message: 'Like removed successfully' });
    } else {
      await Like.create({
        user_id: req.user.id,
        experience_id
      });
      await Experience.findByIdAndUpdate(experience_id, {
        $inc: { like_count: 1 }
      });
      res.json({ message: 'Like added successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Friendship functions
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user_id_1: req.user.id, user_id_2: userId },
        { user_id_1: userId, user_id_2: req.user.id }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship request already exists' });
    }

    const friendship = await Friendship.create({
      user_id_1: req.user.id,
      user_id_2: userId,
      status: 'pending'
    });

    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const respondToFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { accept } = req.body;

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      user_id_2: req.user.id,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found or not pending' });
    }

    if (accept) {
      friendship.status = 'accepted';
      await friendship.save();
      res.json({ message: 'Friend request accepted' });
    } else {
      await Friendship.deleteOne({ _id: friendshipId });
      res.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const friendships = await Friendship.find({
      $or: [{ user_id_1: userId }, { user_id_2: userId }],
      status: 'accepted'
    })
      .populate('user_id_1', 'username profile_picture')
      .populate('user_id_2', 'username profile_picture')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Friendship.countDocuments({
      $or: [{ user_id_1: userId }, { user_id_2: userId }],
      status: 'accepted'
    });

    const friends = friendships.map(friendship => {
      const friend = friendship.user_id_1.toString() === userId ?
        friendship.user_id_2 : friendship.user_id_1;
      return friend;
    });

    res.json({
      friends,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingFriendRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const requests = await Friendship.find({
      user_id_2: req.user.id,
      status: 'pending'
    })
      .populate('user_id_1', 'username profile_picture')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Friendship.countDocuments({
      user_id_2: req.user.id,
      status: 'pending'
    });

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 