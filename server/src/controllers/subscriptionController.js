const subscriptionService = require('../services/subscriptionService');
const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/subscriptions/:channelId
 * @desc    Subscribe or unsubscribe to a channel
 * @access  Private
 */
const toggleSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.toggleSubscription(
    req.user._id,
    req.params.channelId
  );

  if (result.isSubscribed) {
    notificationService.createNotification({
      recipient: req.params.channelId,
      sender: req.user._id,
      type: 'subscribe',
      text: `${req.user.username} subscribed to your channel`,
    }).catch(() => {});
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.isSubscribed ? 'Subscribed to channel' : 'Unsubscribed from channel'
      )
    );
});

/**
 * @route   GET /api/subscriptions/:channelId/status
 * @desc    Check subscription status for authenticated user
 * @access  Public (Optional auth)
 */
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const subscriberId = req.user?._id || null;
  const result = await subscriptionService.getSubscriptionStatus(
    subscriberId,
    req.params.channelId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Subscription status retrieved'));
});

/**
 * @route   GET /api/subscriptions/feed
 * @desc    Get video feed from subscribed channels
 * @access  Private
 */
const getSubscribedFeed = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await subscriptionService.getSubscribedFeed(req.user._id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Subscription feed retrieved successfully'));
});

/**
 * @route   GET /api/subscriptions/channels
 * @desc    Get list of channels user is subscribed to
 * @access  Private
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const channels = await subscriptionService.getSubscribedChannels(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { channels }, 'Subscribed channels list retrieved'));
});

module.exports = {
  toggleSubscription,
  getSubscriptionStatus,
  getSubscribedFeed,
  getSubscribedChannels,
};
