const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', checkRole(['admin', 'coordinator']), createAnnouncement);

module.exports = router;
