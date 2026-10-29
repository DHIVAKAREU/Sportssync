const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

router.use(protect);

router.get('/categories', getCategories);
router.post('/categories', checkRole(['admin', 'equipment_incharge']), createCategory);

router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.post('/', checkRole(['admin', 'equipment_incharge']), createEquipment);
router.put('/:id', checkRole(['admin', 'equipment_incharge']), updateEquipment);
router.delete('/:id', checkRole(['admin', 'equipment_incharge']), deleteEquipment);

module.exports = router;
