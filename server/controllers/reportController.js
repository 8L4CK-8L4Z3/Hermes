import Report from '../models/Report.js';
import { validationResult } from 'express-validator';

export const createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { report_type, target_id, target_type, reason } = req.body;

    const report = await Report.create({
      reporter_id: req.user.id,
      report_type,
      target_id,
      target_type,
      reason,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 10, status, report_type, target_type } = req.query;

    const query = {};
    if (status) query.status = status;
    if (report_type) query.report_type = report_type;
    if (target_type) query.target_type = target_type;

    const reports = await Report.find(query)
      .populate('reporter_id', 'username email')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReport = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporter_id', 'username email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportId } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { $set: { status } },
      { new: true }
    ).populate('reporter_id', 'username email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReportStats = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const stats = await Report.aggregate([
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
      },
      {
        $project: {
          _id: 0,
          totalReports: 1,
          pendingReports: 1,
          resolvedReports: 1
        }
      }
    ]);

    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$report_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const reportsByTargetType = await Report.aggregate([
      {
        $group: {
          _id: '$target_type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0
      },
      byType: reportsByType,
      byTargetType: reportsByTargetType
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { reportId } = req.params;

    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 