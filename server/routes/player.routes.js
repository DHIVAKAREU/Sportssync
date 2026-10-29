const express = require('express');
const router = express.Router();
const {
  registerPlayer,
  getPlayers,
  getPlayerById,
  getMyRegistrations,
  updatePlayerProfile,
  approvePlayer,
  rejectPlayer,
  deletePlayerRegistration,
} = require('../controllers/playerController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.post('/', checkRole(['student', 'admin', 'coordinator']), registerPlayer);
router.get('/me', checkRole(['student']), getMyRegistrations);
router.get('/', checkRole(['admin', 'coordinator', 'coach']), getPlayers);
router.get('/:id', getPlayerById);
router.put('/:id', updatePlayerProfile);
router.patch('/:id/approve', checkRole(['admin', 'coordinator', 'coach']), approvePlayer);
router.patch('/:id/reject', checkRole(['admin', 'coordinator', 'coach']), rejectPlayer);
router.delete('/:id', checkRole(['admin', 'coordinator']), deletePlayerRegistration);

module.exports = router;
