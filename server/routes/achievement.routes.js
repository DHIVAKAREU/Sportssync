const express = require('express');
const router = express.Router();
const {
  getAchievements,
  submitAchievement,
  verifyAchievement,
  updateAchievement,
  deleteAchievement,
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getAchievements);
router.post('/', submitAchievement);
router.patch('/:id/verify', checkRole(['admin', 'coordinator', 'coach']), verifyAchievement);
router.put('/:id', checkRole(['admin', 'coordinator', 'coach']), updateAchievement);
router.delete('/:id', checkRole(['admin', 'coordinator', 'coach']), deleteAchievement);

module.exports = router;
