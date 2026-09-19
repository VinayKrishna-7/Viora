const express = require('express');
const {
  toggleWatchLater,
  getWatchLater,
  getWatchLaterStatus,
} = require('../controllers/watchLaterController');
const { verifyJWT, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, getWatchLater);
router.post('/:videoId', verifyJWT, toggleWatchLater);
router.get('/:videoId/status', optionalAuth, getWatchLaterStatus);

module.exports = router;
