const express = require('express');
const router = express.Router();
const {
  getSports,
  getSportById,
  createSport,
  updateSport,
  toggleSportStatus,
  deleteSport,
} = require('../controllers/sportController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getSports);
router.get('/:id', getSportById);

router.post('/', checkRole(['admin', 'coordinator']), createSport);
router.put('/:id', checkRole(['admin', 'coordinator']), updateSport);
router.patch('/:id/status', checkRole(['admin', 'coordinator']), toggleSportStatus);
router.delete('/:id', checkRole(['admin', 'coordinator']), deleteSport);

module.exports = router;
