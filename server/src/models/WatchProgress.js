const mongoose = require('mongoose');

const watchProgressSchema = new mongoose.Schema(
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
    progressSeconds: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so there is exactly one progress record per user per video
watchProgressSchema.index({ user: 1, video: 1 }, { unique: true });
watchProgressSchema.index({ user: 1, updatedAt: -1 });

const WatchProgress = mongoose.model('WatchProgress', watchProgressSchema);
module.exports = WatchProgress;
