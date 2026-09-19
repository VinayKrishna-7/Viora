const express = require('express');
const {
  getPlatformStats,
  listUsers,
  changeUserRole,
  toggleUserSuspension,
  listAllVideos,
  setVideoVisibility,
  deleteVideoAsAdmin,
} = require('../controllers/adminController');
const { verifyJWT, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);
router.use(requireAdmin);

router.get('/stats', getPlatformStats);

// User moderation
router.get('/users', listUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/suspend', toggleUserSuspension);

// Video moderation
router.get('/videos', listAllVideos);
router.patch('/videos/:id/visibility', setVideoVisibility);
router.delete('/videos/:id', deleteVideoAsAdmin);

module.exports = router;
