const Equipment = require('../models/equipment.model');
const EquipmentCategory = require('../models/equipmentCategories.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// Auto-seed equipment categories & initial stock if empty
const seedEquipmentIfEmpty = async (userId) => {
  const count = await EquipmentCategory.countDocuments();
  if (count === 0) {
    console.log('Seeding equipment categories & inventory...');
    const catBalls = await EquipmentCategory.create({ name: 'Balls', description: 'Sports balls' });
    const catRackets = await EquipmentCategory.create({ name: 'Rackets', description: 'Tennis & Badminton racquets' });
    await EquipmentCategory.create({ name: 'General', description: 'General sports equipment' });

    await Equipment.insertMany([
      {
        equipmentCode: 'EQ-BSK-001',
        name: 'Wilson NCAA Basketball',
        category: catBalls._id,
        totalQuantity: 30,
        availableQuantity: 22,
        issuedQuantity: 8,
        minimumStockLevel: 5,
        condition: 'Good',
        addedBy: userId,
      },
      {
        equipmentCode: 'EQ-FTB-002',
        name: 'Nike Flight Football',
        category: catBalls._id,
        totalQuantity: 20,
        availableQuantity: 2,
        issuedQuantity: 18,
        minimumStockLevel: 5,
        condition: 'Good',
        addedBy: userId,
      },
      {
        equipmentCode: 'EQ-BDM-003',
        name: 'Yonex Arcsaber Badminton Racket',
        category: catRackets._id,
        totalQuantity: 15,
        availableQuantity: 0,
        issuedQuantity: 15,
        minimumStockLevel: 3,
        condition: 'Fair',
        addedBy: userId,
      },
    ]);
  }
};

/**
 * @desc Get all equipment categories
 * @route GET /api/v1/equipment/categories
 * @access Protected
 */
const getCategories = async (req, res, next) => {
  try {
    if (req.user) {
      await seedEquipmentIfEmpty(req.user._id);
    }
    const categories = await EquipmentCategory.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, categories, 'Categories retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create equipment category
 * @route POST /api/v1/equipment/categories
 * @access Protected (Admin, Equipment Incharge)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return errorResponse(res, 400, 'Category name is required', 'MISSING_NAME');

    const existing = await EquipmentCategory.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return errorResponse(res, 400, 'Category with this name already exists', 'DUPLICATE_CATEGORY');
    }

    const category = await EquipmentCategory.create({ name: name.trim(), description });
    return successResponse(res, 201, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all equipment inventory with search and filters
 * @route GET /api/v1/equipment
 * @access Protected
 */
const getEquipment = async (req, res, next) => {
  try {
    if (req.user) {
      await seedEquipmentIfEmpty(req.user._id);
    }

    const query = { isActive: true };

    if (req.query.categoryId) {
      query.category = req.query.categoryId;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: searchRegex }, { equipmentCode: searchRegex }];
    }

    let items = await Equipment.find(query).populate('category', 'name').sort({ createdAt: -1 });

    // Stock Status filter
    if (req.query.status) {
      if (req.query.status === 'out_of_stock') {
        items = items.filter((i) => i.availableQuantity === 0);
      } else if (req.query.status === 'low_stock') {
        items = items.filter((i) => i.availableQuantity > 0 && i.availableQuantity <= (i.minimumStockLevel || 5));
      } else if (req.query.status === 'available') {
        items = items.filter((i) => i.availableQuantity > (i.minimumStockLevel || 5));
      }
    }

    return successResponse(res, 200, items, 'Equipment inventory retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get equipment by ID
 * @route GET /api/v1/equipment/:id
 * @access Protected
 */
const getEquipmentById = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id).populate('category', 'name');
    if (!item) return errorResponse(res, 404, 'Equipment item not found', 'NOT_FOUND');
    return successResponse(res, 200, item, 'Equipment details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add equipment item
 * @route POST /api/v1/equipment
 * @access Protected (Admin, Equipment Incharge)
 */
const createEquipment = async (req, res, next) => {
  try {
    const { equipmentCode, name, categoryId, totalQuantity, minimumStockLevel, condition, purchaseCost, supplier } = req.body;

    const existing = await Equipment.findOne({ equipmentCode });
    if (existing) {
      return errorResponse(res, 400, 'Equipment code already exists', 'DUPLICATE_CODE');
    }

    let category = categoryId;
    if (!category) {
      let defaultCat = await EquipmentCategory.findOne({ name: 'General' });
      if (!defaultCat) {
        defaultCat = await EquipmentCategory.create({ name: 'General', description: 'General equipment' });
      }
      category = defaultCat._id;
    }

    const item = await Equipment.create({
      equipmentCode,
      name,
      category,
      totalQuantity,
      availableQuantity: totalQuantity,
      issuedQuantity: 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStockLevel: minimumStockLevel || 5,
      condition: condition || 'Good',
      purchaseCost: purchaseCost || 0,
      supplier,
      addedBy: req.user._id,
    });

    await logAudit({
      user: req.user,
      action: 'ADD_EQUIPMENT',
      module: 'Equipment Inventory',
      description: `Added equipment ${name} (Qty: ${totalQuantity})`,
      relatedRecordId: item._id,
      req,
    });

    const populatedItem = await Equipment.findById(item._id).populate('category', 'name');
    return successResponse(res, 201, populatedItem, 'Equipment item added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update equipment (Enforces quantity invariant)
 * @route PUT /api/v1/equipment/:id
 * @access Protected (Admin, Equipment Incharge)
 */
const updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return errorResponse(res, 404, 'Equipment item not found', 'NOT_FOUND');

    const { name, categoryId, totalQuantity, availableQuantity, issuedQuantity, damagedQuantity, lostQuantity, condition, minimumStockLevel, purchaseCost, supplier } = req.body;

    const newTotal = totalQuantity !== undefined ? totalQuantity : item.totalQuantity;
    const newAvailable = availableQuantity !== undefined ? availableQuantity : item.availableQuantity;
    const newIssued = issuedQuantity !== undefined ? issuedQuantity : item.issuedQuantity;
    const newDamaged = damagedQuantity !== undefined ? damagedQuantity : item.damagedQuantity;
    const newLost = lostQuantity !== undefined ? lostQuantity : item.lostQuantity;

    // Quantity Invariant Check: totalQuantity === available + issued + damaged + lost
    if (newTotal !== (newAvailable + newIssued + newDamaged + newLost)) {
      return errorResponse(
        res,
        400,
        `Quantity invariant mismatch: Total (${newTotal}) must equal sum of Available (${newAvailable}) + Issued (${newIssued}) + Damaged (${newDamaged}) + Lost (${newLost})`,
        'INVARIANT_MISMATCH'
      );
    }

    if (name) item.name = name;
    if (categoryId) item.category = categoryId;
    item.totalQuantity = newTotal;
    item.availableQuantity = newAvailable;
    item.issuedQuantity = newIssued;
    item.damagedQuantity = newDamaged;
    item.lostQuantity = newLost;
    if (condition) item.condition = condition;
    if (minimumStockLevel !== undefined) item.minimumStockLevel = minimumStockLevel;
    if (purchaseCost !== undefined) item.purchaseCost = purchaseCost;
    if (supplier !== undefined) item.supplier = supplier;

    await item.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_EQUIPMENT',
      module: 'Equipment Inventory',
      description: `Updated equipment ${item.name}`,
      relatedRecordId: item._id,
      req,
    });

    const populated = await Equipment.findById(item._id).populate('category', 'name');
    return successResponse(res, 200, populated, 'Equipment updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete equipment
 * @route DELETE /api/v1/equipment/:id
 * @access Protected (Admin, Equipment Incharge)
 */
const deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) return errorResponse(res, 404, 'Equipment item not found', 'NOT_FOUND');

    await logAudit({
      user: req.user,
      action: 'DELETE_EQUIPMENT',
      module: 'Equipment Inventory',
      description: `Deleted equipment ${item.name}`,
      relatedRecordId: req.params.id,
      req,
    });

    return successResponse(res, 200, null, 'Equipment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
