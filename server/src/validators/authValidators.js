const ApiError = require('../utils/ApiError');

const validateRegister = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
  }

  if (username.trim().length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters long');
  }

  if (username.trim().length > 30) {
    throw new ApiError(400, 'Username cannot exceed 30 characters');
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, username, password } = req.body;
  const identifier = email || username;

  if (!identifier || !password) {
    throw new ApiError(400, 'Email or username and password are required');
  }

  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
    throw new ApiError(400, 'New passwords do not match');
  }

  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { username, description } = req.body;

  if (username !== undefined) {
    if (username.trim().length < 3) {
      throw new ApiError(400, 'Username must be at least 3 characters long');
    }
    if (username.trim().length > 30) {
      throw new ApiError(400, 'Username cannot exceed 30 characters');
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      throw new ApiError(400, 'Username can only contain letters, numbers, and underscores');
    }
  }

  if (description !== undefined && description.length > 1000) {
    throw new ApiError(400, 'Description cannot exceed 1000 characters');
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
};
