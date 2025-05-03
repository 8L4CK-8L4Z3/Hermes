import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Experience from '../models/Experience.js';
import Destination from '../models/Destination.js';
import Activity from '../models/Activity.js';
import Report from '../models/Report.js';
import mongoose from 'mongoose';
import os from 'os';
import logger from '../utils/logger.js';

export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$is_active', true] }, 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$is_admin', true] }, 1, 0] } }
        }
      }
    ]);

    // Get content statistics
    const tripCount = await Trip.countDocuments();
    const experienceCount = await Experience.countDocuments();
    const destinationCount = await Destination.countDocuments();
    const activityCount = await Activity.countDocuments();

    // Get pending approvals
    const pendingDestinations = await Destination.countDocuments({ is_approved: false });
    const pendingActivities = await Activity.countDocuments({ is_approved: false });

    // Get report statistics
    const reportStats = await Report.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pendingReports: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          resolvedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = {
      trips: await Trip.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('user_id', 'username'),
      experiences: await Experience.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('user_id', 'username'),
      reports: await Report.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('reporter_id', 'username')
    };

    res.json({
      users: userStats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0
      },
      content: {
        trips: tripCount,
        experiences: experienceCount,
        destinations: destinationCount,
        activities: activityCount
      },
      pending: {
        destinations: pendingDestinations,
        activities: pendingActivities,
        reports: reportStats[0]?.pendingReports || 0
      },
      reports: reportStats[0] || {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Get MongoDB connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuUsage: process.cpuUsage(),
      loadAverage: os.loadavg(),
      platform: process.platform,
      nodeVersion: process.version
    };

    // Get MongoDB statistics
    const dbMetrics = await mongoose.connection.db.stats();

    // Get active connections
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    const connections = serverStatus.connections;

    res.json({
      status: 'OK',
      timestamp: new Date(),
      database: {
        status: dbStatus,
        metrics: {
          collections: dbMetrics.collections,
          documents: dbMetrics.objects,
          dataSize: dbMetrics.dataSize,
          storageSize: dbMetrics.storageSize,
          indexes: dbMetrics.indexes,
          indexSize: dbMetrics.indexSize
        },
        connections: {
          current: connections.current,
          available: connections.available,
          totalCreated: connections.totalCreated
        }
      },
      system: {
        ...systemMetrics,
        memoryUsage: {
          total: systemMetrics.totalMemory,
          free: systemMetrics.freeMemory,
          used: systemMetrics.totalMemory - systemMetrics.freeMemory,
          usagePercentage: ((systemMetrics.totalMemory - systemMetrics.freeMemory) / systemMetrics.totalMemory * 100).toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getErrorLogs = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 50, level = 'error', startDate, endDate } = req.query;

    // Build query for error logs
    const query = { level };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get error logs from MongoDB
    const logs = await mongoose.connection.db.collection('logs')
      .find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit * 1)
      .toArray();

    const count = await mongoose.connection.db.collection('logs')
      .countDocuments(query);

    // Get error statistics
    const stats = await mongoose.connection.db.collection('logs').aggregate([
      { $match: { level: 'error' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          uniqueErrors: { $addToSet: '$message' }
        }
      }
    ]).toArray();

    res.json({
      logs,
      stats: stats[0] || { total: 0, uniqueErrors: [] },
      pagination: {
        totalLogs: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 10, search, status, role } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.is_active = status === 'active';
    if (role) query.is_admin = role === 'admin';

    const users = await User.find(query)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { userId } = req.params;

    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const stats = {
      trips: await Trip.countDocuments({ user_id: userId }),
      experiences: await Experience.countDocuments({ user_id: userId }),
      reports: await Report.countDocuments({ reporter_id: userId }),
      destinations: await Destination.countDocuments({ created_by: userId }),
      activities: await Activity.countDocuments({ created_by: userId })
    };

    // Get recent activity
    const recentActivity = {
      trips: await Trip.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(5),
      experiences: await Experience.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(5),
      reports: await Report.find({ reporter_id: userId })
        .sort({ created_at: -1 })
        .limit(5)
    };

    res.json({
      user,
      stats,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { userId } = req.params;
    const { is_active, is_admin } = req.body;

    // Don't allow admins to deactivate themselves
    if (userId === req.user.id && is_active === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const updateData = {};
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (typeof is_admin === 'boolean') updateData.is_admin = is_admin;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserActions = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build pipeline for user actions
    const pipeline = [
      { $match: { user_id: mongoose.Types.ObjectId(userId) } },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit * 1 }
    ];

    if (type) {
      pipeline.unshift({ $match: { type } });
    }

    // Get actions from the audit log collection
    const actions = await mongoose.connection.db.collection('audit_logs')
      .aggregate(pipeline)
      .toArray();

    const count = await mongoose.connection.db.collection('audit_logs')
      .countDocuments({ user_id: mongoose.Types.ObjectId(userId) });

    res.json({
      actions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalActions: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 10, type } = req.query;

    let query = { is_approved: false };
    let items = [];
    let count = 0;

    if (type === 'destinations' || !type) {
      const destinations = await Destination.find(query)
        .populate('created_by', 'username email')
        .sort({ created_at: -1 })
        .limit(type ? (limit * 1) : 5)
        .skip(type ? ((page - 1) * limit) : 0);
      
      const destinationCount = await Destination.countDocuments(query);
      
      items = [...items, ...destinations.map(d => ({
        ...d.toObject(),
        type: 'destination'
      }))];
      count += destinationCount;
    }

    if (type === 'activities' || !type) {
      const activities = await Activity.find(query)
        .populate('created_by', 'username email')
        .sort({ created_at: -1 })
        .limit(type ? (limit * 1) : 5)
        .skip(type ? ((page - 1) * limit) : 0);
      
      const activityCount = await Activity.countDocuments(query);
      
      items = [...items, ...activities.map(a => ({
        ...a.toObject(),
        type: 'activity'
      }))];
      count += activityCount;
    }

    // If no specific type is specified, sort combined results by creation date
    if (!type) {
      items.sort((a, b) => b.created_at - a.created_at);
      if (items.length > limit) {
        items = items.slice(0, limit);
      }
    }

    res.json({
      items,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      summary: {
        destinations: await Destination.countDocuments(query),
        activities: await Activity.countDocuments(query)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const processApproval = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { id } = req.params;
    const { type, is_approved, feedback } = req.body;

    if (!type || !['destination', 'activity'].includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const Model = type === 'destination' ? Destination : Activity;
    const item = await Model.findById(id);

    if (!item) {
      return res.status(404).json({ message: `${type} not found` });
    }

    item.is_approved = is_approved;
    item.approval_feedback = feedback;
    item.approved_at = is_approved ? new Date() : null;
    item.approved_by = is_approved ? req.user.id : null;

    await item.save();

    res.json({
      message: `${type} ${is_approved ? 'approved' : 'rejected'} successfully`,
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const processBulkApprovals = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid items array' });
    }

    const results = await Promise.all(items.map(async ({ id, type, is_approved, feedback }) => {
      try {
        if (!['destination', 'activity'].includes(type)) {
          return { id, success: false, message: 'Invalid content type' };
        }

        const Model = type === 'destination' ? Destination : Activity;
        const item = await Model.findById(id);

        if (!item) {
          return { id, success: false, message: `${type} not found` };
        }

        item.is_approved = is_approved;
        item.approval_feedback = feedback;
        item.approved_at = is_approved ? new Date() : null;
        item.approved_by = is_approved ? req.user.id : null;

        await item.save();

        return {
          id,
          success: true,
          message: `${type} ${is_approved ? 'approved' : 'rejected'} successfully`
        };
      } catch (error) {
        return { id, success: false, message: error.message };
      }
    }));

    res.json({
      message: 'Bulk processing completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 50, level, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Query parameters for log filtering
    let query = {};
    if (level) {
      query.level = level.toUpperCase();
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get logs from Winston logger storage
    const logs = await logger.query({
      from: skip,
      until: skip + limit,
      limit: parseInt(limit),
      order: 'desc',
      ...query
    });

    // Get total count for pagination
    const totalLogs = await logger.query({
      ...query,
      count: true
    });

    res.json({
      logs: logs.map(log => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        meta: log.meta
      })),
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system logs', error: error.message });
  }
};

export const getSystemMetrics = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const metrics = {
      system: {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        uptime: process.uptime(),
        cpu: {
          model: os.cpus()[0].model,
          cores: os.cpus().length,
          usage: process.cpuUsage()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          processUsage: process.memoryUsage()
        }
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      env: {
        nodeEnv: process.env.NODE_ENV
      }
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system metrics', error: error.message });
  }
};

export const getApiUsage = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { startDate = new Date(Date.now() - 24*60*60*1000), endDate = new Date() } = req.query;

    // Get API usage statistics from your logging/monitoring system
    const apiStats = await logger.query({
      from: new Date(startDate),
      until: new Date(endDate),
      fields: ['route', 'method', 'statusCode', 'responseTime'],
      order: 'desc'
    });

    // Process and aggregate the statistics
    const stats = {
      totalRequests: apiStats.length,
      routeStats: {},
      methodStats: {},
      statusCodeStats: {},
      averageResponseTime: 0
    };

    let totalResponseTime = 0;

    apiStats.forEach(stat => {
      // Route statistics
      stats.routeStats[stat.route] = (stats.routeStats[stat.route] || 0) + 1;
      
      // Method statistics
      stats.methodStats[stat.method] = (stats.methodStats[stat.method] || 0) + 1;
      
      // Status code statistics
      stats.statusCodeStats[stat.statusCode] = (stats.statusCodeStats[stat.statusCode] || 0) + 1;
      
      // Response time
      totalResponseTime += stat.responseTime || 0;
    });

    stats.averageResponseTime = totalResponseTime / apiStats.length;

    res.json({
      timeRange: {
        start: startDate,
        end: endDate
      },
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving API usage statistics', error: error.message });
  }
};

export const getDatabaseHealth = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Get MongoDB connection status and statistics
    const dbStats = await mongoose.connection.db.stats();
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();

    const health = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      statistics: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        avgObjSize: dbStats.avgObjSize,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      },
      performance: {
        operations: serverStatus.opcounters,
        connections: serverStatus.connections,
        network: serverStatus.network,
        memory: serverStatus.mem
      },
      latency: {
        reads: serverStatus.opLatencies.reads,
        writes: serverStatus.opLatencies.writes,
        commands: serverStatus.opLatencies.commands
      }
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving database health status', error: error.message });
  }
}; 