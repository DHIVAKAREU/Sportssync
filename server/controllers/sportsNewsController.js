const sportsNewsService = require('../services/sportsNews.service');
const NewsBookmark = require('../models/newsBookmark.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc Get global sports news with category filtering, search, and pagination
 * @route GET /api/v1/sports-news
 * @access Protected
 */
const getNews = async (req, res, next) => {
  try {
    const { category = 'all', q = '', page = 1, limit = 9, refresh = false } = req.query;

    // Validate category
    const validCategories = sportsNewsService.getCategories().map((c) => c.id);
    const selectedCategory = String(category).toLowerCase().trim();

    if (!validCategories.includes(selectedCategory)) {
      return errorResponse(
        res,
        400,
        `Invalid category '${category}'. Valid categories are: ${validCategories.join(', ')}`,
        'INVALID_CATEGORY'
      );
    }

    // Validate search query length
    const searchQuery = String(q).trim().slice(0, 100);

    // Validate pagination bounds
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
    const forceRefresh = refresh === 'true' || refresh === true || refresh === '1';

    const result = await sportsNewsService.getSportsNews({
      category: selectedCategory,
      q: searchQuery,
      page: pageNum,
      limit: limitNum,
      forceRefresh,
    });

    return successResponse(res, 200, result, 'Sports news retrieved successfully');
  } catch (error) {
    console.error('[sportsNewsController] getNews error:', error.message);
    return errorResponse(
      res,
      502,
      'Unable to retrieve live sports news at this time. Please try refreshing or check network connectivity.',
      'NEWS_PROVIDER_ERROR'
    );
  }
};

/**
 * @desc Get list of supported sports categories
 * @route GET /api/v1/sports-news/categories
 * @access Protected
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = sportsNewsService.getCategories();
    return successResponse(res, 200, categories, 'Sports categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get user's saved/bookmarked news articles
 * @route GET /api/v1/sports-news/bookmarks
 * @access Protected
 */
const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await NewsBookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, bookmarks, 'Bookmarked articles retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Save an article to user's bookmarks
 * @route POST /api/v1/sports-news/bookmarks
 * @access Protected
 */
const saveBookmark = async (req, res, next) => {
  try {
    const { articleId, title, description, url, imageUrl, source, publishedAt, category } = req.body;

    if (!articleId || !title || !url) {
      return errorResponse(res, 400, 'articleId, title, and url are required fields', 'VALIDATION_ERROR');
    }

    const bookmark = await NewsBookmark.findOneAndUpdate(
      { user: req.user._id, articleId },
      {
        user: req.user._id,
        articleId,
        title,
        description: description || '',
        url,
        imageUrl: imageUrl || '',
        source: source || 'Sports News',
        publishedAt: publishedAt || new Date(),
        category: category || 'all',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, 201, bookmark, 'Article saved to bookmarks');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Remove an article from user's bookmarks
 * @route DELETE /api/v1/sports-news/bookmarks/:id
 * @access Protected
 */
const deleteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support deleting by MongoDB _id or by articleId string
    const result = await NewsBookmark.findOneAndDelete({
      user: req.user._id,
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { articleId: id }],
    });

    if (!result) {
      return errorResponse(res, 404, 'Bookmark not found or already removed', 'NOT_FOUND');
    }

    return successResponse(res, 200, { deletedId: id }, 'Article removed from bookmarks');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNews,
  getCategories,
  getBookmarks,
  saveBookmark,
  deleteBookmark,
};
