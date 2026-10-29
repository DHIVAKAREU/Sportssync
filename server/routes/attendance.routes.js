const express = require('express');
const router = express.Router();
const { markBulkAttendance, getAttendance, getAttendanceStats } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.post('/bulk', checkRole(['admin', 'coordinator', 'coach']), markBulkAttendance);
router.get('/stats', getAttendanceStats);
router.get('/', getAttendance);

module.exports = router;
