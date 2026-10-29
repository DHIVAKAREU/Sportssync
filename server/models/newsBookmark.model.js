const mongoose = require('mongoose');

const newsBookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    articleId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      default: 'Sports News',
      trim: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      default: 'all',
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index so a user cannot duplicate-bookmark the exact same article URL
newsBookmarkSchema.index({ user: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('NewsBookmark', newsBookmarkSchema);
