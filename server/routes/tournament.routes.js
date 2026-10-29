const express = require('express');
const router = express.Router();
const {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerTeam,
  generateFixtures,
  getFixtures,
  updateFixture,
  updateMatchResult,
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.post('/', checkRole(['admin', 'coordinator']), createTournament);
router.put('/:id', checkRole(['admin', 'coordinator']), updateTournament);
router.delete('/:id', checkRole(['admin', 'coordinator']), deleteTournament);

router.post('/:id/register-team', checkRole(['admin', 'coordinator', 'coach']), registerTeam);
router.post('/:id/generate-fixtures', checkRole(['admin', 'coordinator']), generateFixtures);
router.get('/:id/fixtures', getFixtures);

router.put('/fixtures/:fixtureId', checkRole(['admin', 'coordinator']), updateFixture);
router.patch('/fixtures/:fixtureId/result', checkRole(['admin', 'coordinator', 'coach']), updateMatchResult);

module.exports = router;
