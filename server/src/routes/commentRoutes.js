const express = require('express');
const {
  getCommentReplies,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id/replies', getCommentReplies);
router.put('/:id', verifyJWT, updateComment);
router.delete('/:id', verifyJWT, deleteComment);

module.exports = router;
