const commentService = require('../services/commentService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   POST /api/videos/:id/comments
 * @desc    Add comment or reply
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { text, parentCommentId } = req.body;
  const comment = await commentService.addComment({
    videoId: req.params.id,
    userId: req.user._id,
    text,
    parentCommentId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, 'Comment added successfully'));
});

/**
 * @route   GET /api/videos/:id/comments
 * @desc    Get paginated comments for video
 * @access  Public
 */
const getVideoComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await commentService.getVideoComments(req.params.id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Comments retrieved successfully'));
});

/**
 * @route   GET /api/comments/:id/replies
 * @desc    Get nested replies for a comment
 * @access  Public
 */
const getCommentReplies = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await commentService.getCommentReplies(req.params.id, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Replies retrieved successfully'));
});

/**
 * @route   PUT /api/comments/:id
 * @desc    Update own comment
 * @access  Private
 */
const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const updatedComment = await commentService.updateComment(
    req.params.id,
    req.user._id,
    text
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, 'Comment updated successfully'));
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete own comment
 * @access  Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Comment deleted successfully'));
});

module.exports = {
  addComment,
  getVideoComments,
  getCommentReplies,
  updateComment,
  deleteComment,
};
