const reportService = require('../services/reportService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/reports
 * @desc    Submit content or user report
 * @access  Private
 */
const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, description } = req.body;
  const report = await reportService.createReport({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, report, 'Report submitted successfully for review'));
});

/**
 * @route   GET /api/reports
 * @desc    Get reports list (Admin)
 * @access  Private (Admin)
 */
const getReports = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await reportService.getReports({ status, page, limit });

  return res.status(200).json(new ApiResponse(200, result, 'Reports retrieved successfully'));
});

/**
 * @route   PATCH /api/reports/:id/status
 * @desc    Update report status (Admin)
 * @access  Private (Admin)
 */
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await reportService.updateReportStatus(
    req.params.id,
    req.user._id,
    status
  );

  return res
    .status(200)
    .json(new ApiResponse(200, report, `Report marked as ${status}`));
});

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
};
