const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT token from HTTP-only cookie or Authorization header
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  // Also support Authorization Bearer header if provided
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }

  try {
    const secret = process.env.JWT_SECRET || 'viora_development_super_secret_key_2026_secure';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid authentication token. User not found.');
    }

    if (user.isSuspended) {
      throw new ApiError(403, 'Your account has been suspended by an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid or corrupted authentication token.');
  }
});

/**
 * Optional authentication: attaches user if valid token exists, but doesn't block if anonymous
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'viora_development_super_secret_key_2026_secure';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isSuspended) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }

  next();
});

/**
 * Role-Based Access Control Middleware Generator
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Forbidden. Requires one of roles: [${roles.join(', ')}]`);
    }

    next();
  };
};

const requireCreator = requireRole('creator', 'admin');
const requireAdmin = requireRole('admin');

module.exports = {
  verifyJWT,
  requireAuth: verifyJWT,
  optionalAuth,
  requireRole,
  requireCreator,
  requireAdmin,
};
