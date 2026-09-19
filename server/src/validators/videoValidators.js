const ApiError = require('../utils/ApiError');

const ALLOWED_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'Programming',
  'Education',
  'News',
  'Sports',
  'Entertainment',
  'Technology',
  'Travel',
  'Comedy',
  'Movies',
  'Science',
];

const ALLOWED_VISIBILITY = ['public', 'private', 'unlisted'];

const validateCreateVideo = (req, res, next) => {
  const { title, description, category, visibility } = req.body;

  if (!title || title.trim().length < 3) {
    throw new ApiError(400, 'Title is required and must be at least 3 characters long');
  }

  if (title.trim().length > 120) {
    throw new ApiError(400, 'Title cannot exceed 120 characters');
  }

  if (description && description.length > 5000) {
    throw new ApiError(400, 'Description cannot exceed 5000 characters');
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
  }

  if (visibility && !ALLOWED_VISIBILITY.includes(visibility)) {
    throw new ApiError(400, `Invalid visibility. Allowed: ${ALLOWED_VISIBILITY.join(', ')}`);
  }

  // Check files uploaded via multer
  if (!req.files || !req.files.video || req.files.video.length === 0) {
    throw new ApiError(400, 'Video file is required');
  }

  if (!req.files || !req.files.thumbnail || req.files.thumbnail.length === 0) {
    throw new ApiError(400, 'Thumbnail image is required');
  }

  next();
};

const validateUpdateVideo = (req, res, next) => {
  const { title, description, category, visibility } = req.body;

  if (title !== undefined) {
    if (title.trim().length < 3) {
      throw new ApiError(400, 'Title must be at least 3 characters long');
    }
    if (title.trim().length > 120) {
      throw new ApiError(400, 'Title cannot exceed 120 characters');
    }
  }

  if (description !== undefined && description.length > 5000) {
    throw new ApiError(400, 'Description cannot exceed 5000 characters');
  }

  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(400, `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
  }

  if (visibility !== undefined && !ALLOWED_VISIBILITY.includes(visibility)) {
    throw new ApiError(400, `Invalid visibility. Allowed: ${ALLOWED_VISIBILITY.join(', ')}`);
  }

  next();
};

module.exports = {
  validateCreateVideo,
  validateUpdateVideo,
  ALLOWED_CATEGORIES,
  ALLOWED_VISIBILITY,
};
