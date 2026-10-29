const BorrowRecord = require('../models/borrowRecords.model');
const Equipment = require('../models/equipment.model');
const Fine = require('../models/fines.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Student submits borrow request (FR-EQ-2: Cannot request > availableQuantity)
 * @route POST /api/v1/borrow/request
 * @access Protected (Student)
 */
const requestBorrow = async (req, res, next) => {
  try {
    const { equipmentId, quantity, dueDate, notes } = req.body;
    const borrowerId = req.user._id;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || !equipment.isActive) {
      return errorResponse(res, 404, 'Equipment item not found', 'NOT_FOUND');
    }

    // FR-EQ-2: Borrow request cannot request more than availableQuantity
    if (quantity > equipment.availableQuantity) {
      return errorResponse(
        res,
        400,
        `Cannot request ${quantity} units. Only ${equipment.availableQuantity} available in stock.`,
        'INSUFFICIENT_STOCK'
      );
    }

    const borrowRecord = await BorrowRecord.create({
      borrower: borrowerId,
      equipment: equipmentId,
      quantity,
      dueDate: new Date(dueDate),
      status: 'Pending',
      notes,
    });

    const Notification = require('../models/notifications.model');
    await Notification.create({
      recipient: borrowerId,
      title: 'Borrow Request Submitted',
      message: `Your request to borrow ${equipment.name} (${quantity} units) has been submitted for approval.`,
      type: 'equipment',
      link: '/borrow',
    });

    const populated = await BorrowRecord.findById(borrowRecord._id)
      .populate('borrower', 'name email registerNumber')
      .populate('equipment', 'name equipmentCode');

    return successResponse(res, 201, populated, 'Borrow request submitted for approval');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Issue equipment (FR-EQ-3: Decrements availableQuantity, increments issuedQuantity)
 * @route PATCH /api/v1/borrow/:id/issue
 * @access Protected (Admin, Equipment Incharge)
 */
const issueEquipment = async (req, res, next) => {
  try {
    const borrowRecord = await BorrowRecord.findById(req.params.id);
    if (!borrowRecord) return errorResponse(res, 404, 'Borrow record not found', 'NOT_FOUND');

    if (borrowRecord.status !== 'Pending') {
      return errorResponse(res, 400, `Cannot issue equipment with status ${borrowRecord.status}`, 'INVALID_STATUS');
    }

    const equipment = await Equipment.findById(borrowRecord.equipment);
    if (equipment.availableQuantity < borrowRecord.quantity) {
      return errorResponse(res, 400, 'Insufficient available stock to issue', 'INSUFFICIENT_STOCK');
    }

    // FR-EQ-3: Atomic quantity update
    equipment.availableQuantity -= borrowRecord.quantity;
    equipment.issuedQuantity += borrowRecord.quantity;
    await equipment.save();

    borrowRecord.status = 'Issued';
    borrowRecord.approvedBy = req.user._id;
    borrowRecord.issueDate = new Date();
    await borrowRecord.save();

    const Notification = require('../models/notifications.model');
    await Notification.create({
      recipient: borrowRecord.borrower,
      title: 'Equipment Issued',
      message: `Your borrow request for ${equipment.name} has been issued. Due date: ${new Date(borrowRecord.dueDate).toLocaleDateString()}`,
      type: 'equipment',
      link: '/borrow',
    });

    await logAudit({
      user: req.user,
      action: 'ISSUE_EQUIPMENT',
      module: 'Borrow/Return',
      description: `Issued ${borrowRecord.quantity} units of ${equipment.name} to student ${borrowRecord.borrower}`,
      relatedRecordId: borrowRecord._id,
      req,
    });

    return successResponse(res, 200, borrowRecord, 'Equipment issued successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Return equipment (FR-EQ-4 & FR-FINE-1)
 * @route PATCH /api/v1/borrow/:id/return
 * @access Protected (Admin, Equipment Incharge)
 */
const returnEquipment = async (req, res, next) => {
  try {
    const { conditionAtReturn } = req.body;
    const borrowRecord = await BorrowRecord.findById(req.params.id);
    if (!borrowRecord) return errorResponse(res, 404, 'Borrow record not found', 'NOT_FOUND');

    if (borrowRecord.status === 'Returned') {
      return errorResponse(res, 400, 'Equipment has already been returned', 'ALREADY_RETURNED');
    }

    const equipment = await Equipment.findById(borrowRecord.equipment);
    const returnDate = new Date();
    borrowRecord.returnDate = returnDate;
    borrowRecord.conditionAtReturn = conditionAtReturn || 'Good';

    // Quantity reallocation (FR-EQ-4)
    equipment.issuedQuantity = Math.max(0, equipment.issuedQuantity - borrowRecord.quantity);

    if (conditionAtReturn === 'Damaged') {
      equipment.damagedQuantity += borrowRecord.quantity;
      borrowRecord.status = 'Damaged';
    } else if (conditionAtReturn === 'Lost') {
      equipment.lostQuantity += borrowRecord.quantity;
      borrowRecord.status = 'Lost';
    } else {
      equipment.availableQuantity += borrowRecord.quantity;
      borrowRecord.status = 'Returned';
    }
    await equipment.save();

    // Fine calculation (FR-FINE-1: Overdue days * daily rate)
    const dueDate = new Date(borrowRecord.dueDate);
    let fineCreated = null;

    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dailyRate = 20; // Default ₹20/day
      const amount = overdueDays * dailyRate;

      fineCreated = await Fine.create({
        borrowRecord: borrowRecord._id,
        student: borrowRecord.borrower,
        reason: 'Late Return',
        overdueDays,
        ratePerDay: dailyRate,
        amount,
        status: 'Unpaid',
      });
    }

    // Additional Damaged / Lost fine stacking
    if (conditionAtReturn === 'Damaged') {
      const damageAmount = (equipment.purchaseCost || 500) * 0.5; // 50% replacement fee
      await Fine.create({
        borrowRecord: borrowRecord._id,
        student: borrowRecord.borrower,
        reason: 'Damaged',
        amount: damageAmount,
        status: 'Unpaid',
      });
    } else if (conditionAtReturn === 'Lost') {
      const replacementCost = equipment.purchaseCost || 1000;
      await Fine.create({
        borrowRecord: borrowRecord._id,
        student: borrowRecord.borrower,
        reason: 'Lost',
        amount: replacementCost,
        status: 'Unpaid',
      });
    }

    await borrowRecord.save();

    const Notification = require('../models/notifications.model');
    await Notification.create({
      recipient: borrowRecord.borrower,
      title: 'Equipment Returned',
      message: `Your return for ${equipment.name} (${conditionAtReturn || 'Good'}) has been processed. ${fineCreated ? `Late fine incurred: ₹${fineCreated.amount}` : ''}`,
      type: fineCreated ? 'fine' : 'equipment',
      link: fineCreated ? '/fines' : '/borrow',
    });

    await logAudit({
      user: req.user,
      action: 'RETURN_EQUIPMENT',
      module: 'Borrow/Return',
      description: `Returned equipment ${equipment.name} with condition ${conditionAtReturn || 'Good'}`,
      relatedRecordId: borrowRecord._id,
      req,
    });

    return successResponse(res, 200, { borrowRecord, fine: fineCreated }, 'Equipment return processed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get borrow records
 * @route GET /api/v1/borrow
 * @access Protected
 */
const getBorrows = async (req, res, next) => {
  try {
    const query = {};
    const userRole = req.user.role.name.toLowerCase();

    if (userRole === 'student') {
      query.borrower = req.user._id;
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    const records = await BorrowRecord.find(query)
      .populate('borrower', 'name email registerNumber department')
      .populate('equipment', 'name equipmentCode category')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, records, 'Borrow records retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestBorrow,
  issueEquipment,
  returnEquipment,
  getBorrows,
};
