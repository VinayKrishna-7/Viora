const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const { user, token } = await authService.register({ username, email, password });

  res.cookie('token', token, getCookieOptions());

  return res
    .status(201)
    .json(new ApiResponse(201, { user, token }, 'User registered successfully'));
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get session cookie
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const { user, token } = await authService.login({ email, username, password });

  res.cookie('token', token, getCookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, 'Logged in successfully'));
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear auth cookie and logout
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user retrieved'));
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { user, token } = await authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  res.cookie('token', token, getCookieOptions());

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Password changed successfully'));
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile details
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, description, avatar, banner } = req.body;
  const updatedUser = await authService.updateProfile(req.user._id, {
    username,
    description,
    avatar,
    banner,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully'));
});

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user._id);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Account deleted successfully'));
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  updateProfile,
  deleteAccount,
};
