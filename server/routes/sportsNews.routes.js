const express = require('express');
const router = express.Router();
const {
  getNews,
  getCategories,
  getBookmarks,
  saveBookmark,
  deleteBookmark,
} = require('../controllers/sportsNewsController');
const { protect } = require('../middleware/auth');

// All news routes are protected for authenticated SportSync users
router.use(protect);

router.get('/', getNews);
router.get('/categories', getCategories);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', saveBookmark);
router.delete('/bookmarks/:id', deleteBookmark);

module.exports = router;
