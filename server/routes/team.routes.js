const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  setCaptain,
  assignCoach,
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getTeams);
router.get('/:id', getTeamById);

router.post('/', checkRole(['admin', 'coordinator', 'coach']), createTeam);
router.put('/:id', checkRole(['admin', 'coordinator', 'coach']), updateTeam);
router.delete('/:id', checkRole(['admin', 'coordinator']), deleteTeam);

router.post('/:id/members', checkRole(['admin', 'coordinator', 'coach']), addTeamMember);
router.delete('/:id/members/:playerId', checkRole(['admin', 'coordinator', 'coach']), removeTeamMember);

router.patch('/:id/captain', checkRole(['admin', 'coordinator', 'coach']), setCaptain);
router.patch('/:id/coach', checkRole(['admin', 'coordinator']), assignCoach);

module.exports = router;
