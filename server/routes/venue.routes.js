const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getVenues);
router.get('/:id', getVenueById);

router.post('/', checkRole(['admin', 'coordinator']), createVenue);
router.put('/:id', checkRole(['admin', 'coordinator']), updateVenue);
router.patch('/:id', checkRole(['admin', 'coordinator']), updateVenue);
router.delete('/:id', checkRole(['admin', 'coordinator']), deleteVenue);

module.exports = router;
