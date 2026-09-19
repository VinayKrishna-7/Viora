const mongoose = require('mongoose');

const watchLaterSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A video can only be in a user's Watch Later list once
watchLaterSchema.index({ user: 1, video: 1 }, { unique: true });
watchLaterSchema.index({ user: 1, createdAt: -1 });

const WatchLater = mongoose.model('WatchLater', watchLaterSchema);
module.exports = WatchLater;
