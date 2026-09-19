const adminService = require('../services/adminService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform metrics overview
 * @access  Private (Admin)
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  return res.status(200).json(new ApiResponse(200, stats, 'Platform stats retrieved'));
});

/**
 * @route   GET /api/admin/users
 * @desc    Search and paginate all platform users
 * @access  Private (Admin)
 */
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page, limit } = req.query;
  const result = await adminService.listUsers({ search, role, page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Users list retrieved'));
});

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin)
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const updatedUser = await adminService.changeUserRole(req.params.id, role);
  return res.status(200).json(new ApiResponse(200, updatedUser, 'User role updated'));
});

/**
 * @route   PATCH /api/admin/users/:id/suspend
 * @desc    Toggle user account suspension
 * @access  Private (Admin)
 */
const toggleUserSuspension = asyncHandler(async (req, res) => {
  const result = await adminService.toggleUserSuspension(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.isSuspended ? 'User account suspended' : 'User account unsuspended'
      )
    );
});

/**
 * @route   GET /api/admin/videos
 * @desc    List all videos across platform
 * @access  Private (Admin)
 */
const listAllVideos = asyncHandler(async (req, res) => {
  const { search, visibility, page, limit } = req.query;
  const result = await adminService.listAllVideos({ search, visibility, page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Videos list retrieved'));
});

/**
 * @route   PATCH /api/admin/videos/:id/visibility
 * @desc    Change video visibility as admin
 * @access  Private (Admin)
 */
const setVideoVisibility = asyncHandler(async (req, res) => {
  const { visibility } = req.body;
  const video = await adminService.setVideoVisibility(req.params.id, visibility);
  return res.status(200).json(new ApiResponse(200, video, 'Video visibility updated'));
});

/**
 * @route   DELETE /api/admin/videos/:id
 * @desc    Delete video as admin
 * @access  Private (Admin)
 */
const deleteVideoAsAdmin = asyncHandler(async (req, res) => {
  await adminService.deleteVideoAsAdmin(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Video removed by administrator'));
});

module.exports = {
  getPlatformStats,
  listUsers,
  changeUserRole,
  toggleUserSuspension,
  listAllVideos,
  setVideoVisibility,
  deleteVideoAsAdmin,
};
