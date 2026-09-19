const express = require('express');
const {
  createVideo,
  getAllVideos,
  getVideoById,
  incrementViews,
  getVideosByChannel,
  updateVideo,
  deleteVideo,
  getRecommendations,
  getLikedVideos,
} = require('../controllers/videoController');
const { verifyJWT, optionalAuth } = require('../middleware/authMiddleware');
const {
  uploadVideoAndThumbnail,
  uploadThumbnailOnly,
} = require('../middleware/multerMiddleware');
const {
  validateCreateVideo,
  validateUpdateVideo,
} = require('../validators/videoValidators');
const {
  toggleInteraction,
  getInteractionStatus,
} = require('../controllers/interactionController');
const {
  addComment,
  getVideoComments,
} = require('../controllers/commentController');

const router = express.Router();

// Public Routes (or optional auth)
router.get('/', optionalAuth, getAllVideos);
router.get('/channel/:username', optionalAuth, getVideosByChannel);
router.get('/liked', verifyJWT, getLikedVideos);
router.get('/:id', optionalAuth, getVideoById);
router.patch('/:id/view', incrementViews);
router.get('/:id/interaction', optionalAuth, getInteractionStatus);
router.get('/:id/comments', getVideoComments);
router.get('/:id/recommendations', getRecommendations);

// Protected Interaction & Comment Routes
router.post('/:id/like', verifyJWT, toggleInteraction);
router.post('/:id/comments', verifyJWT, addComment);

// Protected Routes
router.post(
  '/',
  verifyJWT,
  uploadVideoAndThumbnail,
  validateCreateVideo,
  createVideo
);

router.put(
  '/:id',
  verifyJWT,
  uploadThumbnailOnly,
  validateUpdateVideo,
  updateVideo
);

router.delete('/:id', verifyJWT, deleteVideo);

module.exports = router;
