const express = require('express');
const router = express.Router();
const {
  requestBorrow,
  issueEquipment,
  returnEquipment,
  getBorrows,
} = require('../controllers/borrowController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.post('/request', checkRole(['student']), requestBorrow);
router.patch('/:id/issue', checkRole(['admin', 'equipment_incharge']), issueEquipment);
router.patch('/:id/return', checkRole(['admin', 'equipment_incharge']), returnEquipment);
router.get('/', getBorrows);

module.exports = router;
