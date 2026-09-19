const express = require('express');
const {
  toggleSubscription,
  getSubscriptionStatus,
  getSubscribedFeed,
  getSubscribedChannels,
} = require('../controllers/subscriptionController');
const { verifyJWT, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/feed', verifyJWT, getSubscribedFeed);
router.get('/channels', verifyJWT, getSubscribedChannels);
router.get('/:channelId/status', optionalAuth, getSubscriptionStatus);
router.post('/:channelId', verifyJWT, toggleSubscription);

module.exports = router;
