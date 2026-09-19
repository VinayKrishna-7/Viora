const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    targetType: {
      type: String,
      enum: ['video', 'comment', 'user'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reason: {
      type: String,
      enum: [
        'Spam',
        'Harassment',
        'Copyright',
        'Violence',
        'Misleading',
        'Illegal content',
        'Other',
        'spam',
        'harassment',
        'hate_speech',
        'violence',
        'copyright',
        'misinformation',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

// Ensure reporter is populated from reportedBy if either is provided
reportSchema.pre('save', function (next) {
  if (!this.reporter && this.reportedBy) {
    this.reporter = this.reportedBy;
  }
  if (!this.reportedBy && this.reporter) {
    this.reportedBy = this.reporter;
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
