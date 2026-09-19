const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video file URL is required'],
    },
    publicId: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail image URL is required'],
    },
    thumbnailPublicId: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'All',
      enum: [
        'All',
        'Tech',
        'Technology',
        'Programming',
        'Music',
        'Gaming',
        'Education',
        'News',
        'Sports',
        'Entertainment',
        'Travel',
        'Comedy',
        'Movies',
        'Science',
      ],
      index: true,
    },
    duration: {
      type: Number,
      default: 0, // duration in seconds
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isShort: {
      type: Boolean,
      default: false,
      index: true,
    },
    videoPublicId: {
      type: String,
      default: '',
    },
    processingStatus: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'failed'],
      default: 'ready',
      index: true,
    },
    processingError: {
      type: String,
      default: null,
    },
    streamingManifestUrl: {
      type: String,
      default: null,
    },
    chapters: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        startSeconds: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtitles: [
      {
        language: {
          type: String,
          required: true,
          trim: true,
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
        },
        format: {
          type: String,
          default: 'vtt',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound and text search indexes
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
