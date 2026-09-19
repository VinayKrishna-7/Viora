const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Service handling authentication and user profile operations
 */
class AuthService {
  async register({ username, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check existing email
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      throw new ApiError(409, 'Username is already taken. Please choose another.');
    }

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    const token = user.generateToken();
    const userResponse = user.toJSON();

    return { user: userResponse, token };
  }

  async login({ email, username, password }) {
    const identifier = (email || username || '').toLowerCase().trim();

    // Find user by email OR username with password selected explicitly
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email/username or password');
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email/username or password');
    }

    const token = user.generateToken();
    const userResponse = user.toJSON();

    return { user: userResponse, token };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password cannot be the same as current password');
    }

    user.password = newPassword;
    await user.save();

    const token = user.generateToken();
    return { user: user.toJSON(), token };
  }

  async updateProfile(userId, { username, description, avatar, banner }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (username && username.toLowerCase().trim() !== user.username) {
      const normalizedUsername = username.toLowerCase().trim();
      const existing = await User.findOne({ username: normalizedUsername });
      if (existing) {
        throw new ApiError(409, 'Username is already taken');
      }
      user.username = normalizedUsername;
    }

    if (description !== undefined) {
      user.description = description;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    if (banner) {
      user.banner = banner;
    }

    await user.save();
    return user.toJSON();
  }

  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await User.findByIdAndDelete(userId);
    return true;
  }
}

module.exports = new AuthService();
