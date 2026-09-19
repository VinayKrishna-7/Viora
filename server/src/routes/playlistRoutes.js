const express = require('express');
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} = require('../controllers/playlistController');
const { verifyJWT, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(verifyJWT, createPlaylist)
  .get(verifyJWT, getUserPlaylists);

router.route('/:id')
  .get(optionalAuth, getPlaylistById)
  .put(verifyJWT, updatePlaylist)
  .delete(verifyJWT, deletePlaylist);

router.route('/:id/videos/:videoId')
  .post(verifyJWT, addVideoToPlaylist)
  .delete(verifyJWT, removeVideoFromPlaylist);

module.exports = router;
