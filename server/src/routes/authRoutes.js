const express = require('express');
const {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  updateProfile,
  deleteAccount,
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
} = require('../validators/authValidators');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected Routes
router.get('/me', verifyJWT, getCurrentUser);
router.put('/change-password', verifyJWT, validateChangePassword, changePassword);
router.put('/profile', verifyJWT, validateUpdateProfile, updateProfile);
router.delete('/account', verifyJWT, deleteAccount);

module.exports = router;
