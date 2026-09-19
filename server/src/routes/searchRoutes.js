const express = require('express');
const {
  searchVideos,
  getYouTubeVideoDetails,
  getRelatedYouTubeVideos,
} = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchVideos);
router.get('/youtube/:videoId', getYouTubeVideoDetails);
router.get('/youtube/:videoId/related', getRelatedYouTubeVideos);

module.exports = router;

