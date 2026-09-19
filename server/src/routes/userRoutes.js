const express = require('express');
const {
  getCurrentUser,
  getChannelProfile,
  deleteMyAccount,
} = require('../controllers/userController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', verifyJWT, getCurrentUser);
router.delete('/me', verifyJWT, deleteMyAccount);
router.get('/:username', getChannelProfile);

module.exports = router;
