const interactionService = require('../services/interactionService');
const notificationService = require('../services/notificationService');
const Video = require('../models/Video');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/videos/:id/like
 * @desc    Toggle like or dislike on video
 * @access  Private
 */
const toggleInteraction = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const result = await interactionService.toggleInteraction(
    req.params.id,
    req.user._id,
    type
  );

  if (type === 'like' && result.userInteraction === 'like') {
    Video.findById(req.params.id).select('owner').lean().then((vid) => {
      if (vid && vid.owner) {
        notificationService.createNotification({
          recipient: vid.owner,
          sender: req.user._id,
          type: 'like',
          video: req.params.id,
          text: `${req.user.username} liked your video`,
        }).catch(() => {});
      }
    }).catch(() => {});
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, `Video ${type || 'interaction'} updated`));
});

/**
 * @route   GET /api/videos/:id/interaction
 * @desc    Get user's like/dislike status and total counts
 * @access  Public (Optional auth)
 */
const getInteractionStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const result = await interactionService.getInteractionStatus(req.params.id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Video interaction status retrieved'));
});

module.exports = {
  toggleInteraction,
  getInteractionStatus,
};
