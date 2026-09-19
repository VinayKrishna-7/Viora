const express = require('express');
const {
  saveProgress,
  getProgress,
  getContinueWatching,
} = require('../controllers/progressController');
const { verifyJWT, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/continue-watching', verifyJWT, getContinueWatching);
router.get('/:videoId', optionalAuth, getProgress);
router.post('/:videoId', verifyJWT, saveProgress);

module.exports = router;
