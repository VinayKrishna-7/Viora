const mongoose = require('mongoose');

const commentInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'dislike'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentInteractionSchema.index({ user: 1, comment: 1 }, { unique: true });

const CommentInteraction = mongoose.model('CommentInteraction', commentInteractionSchema);
module.exports = CommentInteraction;
