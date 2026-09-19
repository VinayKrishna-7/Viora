const mongoose = require('mongoose');

const videoLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
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

// Compound unique index: A user can only have one interaction (like or dislike) per video
videoLikeSchema.index({ user: 1, video: 1 }, { unique: true });

const VideoLike = mongoose.model('VideoLike', videoLikeSchema);
module.exports = VideoLike;
