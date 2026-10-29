const express = require('express');
const router = express.Router();
const { getFines, payFine, waiveFine } = require('../controllers/fineController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getFines);
router.patch('/:id/pay', checkRole(['admin', 'coordinator', 'equipment_incharge']), payFine);
router.patch('/:id/waive', checkRole(['admin', 'coordinator']), waiveFine);

module.exports = router;
