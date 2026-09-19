const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');

class ReportService {
  /**
   * Submit a new moderation report
   */
  async createReport({ reporter, targetType, targetId, reason, description = '' }) {
    if (!targetType || !targetId || !reason) {
      throw new ApiError(400, 'Target type, target ID, and reason are required');
    }

    const reportData = {
      reporter,
      targetType,
      reason,
      description: description.trim(),
    };

    if (targetType === 'video') reportData.video = targetId;
    else if (targetType === 'comment') reportData.comment = targetId;
    else if (targetType === 'user') reportData.user = targetId;

    return await Report.create(reportData);
  }

  /**
   * List reports for admin review
   */
  async getReports({ status = 'pending', page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('reporter', 'username email avatar')
        .populate('video', 'title thumbnailUrl owner')
        .populate('comment', 'text user video')
        .populate('user', 'username email')
        .populate('reviewedBy', 'username')
        .lean(),
      Report.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
      },
    };
  }

  /**
   * Resolve or dismiss a report
   */
  async updateReportStatus(reportId, reviewerId, status) {
    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      throw new ApiError(400, 'Invalid report status');
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    return report;
  }
}

module.exports = new ReportService();
