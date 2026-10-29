const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/export', checkRole(['admin', 'coordinator', 'equipment_incharge']), exportReport);
router.get('/export/:type', checkRole(['admin', 'coordinator', 'equipment_incharge']), exportReport);

module.exports = router;
