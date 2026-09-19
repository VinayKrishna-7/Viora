const express = require('express');
const {
  getStudioAnalytics,
  getStudioContent,
  getStudioComments,
} = require('../controllers/studioController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.get('/analytics', getStudioAnalytics);
router.get('/content', getStudioContent);
router.get('/comments', getStudioComments);

module.exports = router;
