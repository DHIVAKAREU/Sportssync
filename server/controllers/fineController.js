const Fine = require('../models/fines.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Get fines list
 * @route GET /api/v1/fines
 * @access Protected
 */
const getFines = async (req, res, next) => {
  try {
    const query = {};
    const userRole = req.user.role.name.toLowerCase();

    if (userRole === 'student') {
      query.student = req.user._id;
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    const fines = await Fine.find(query)
      .populate('student', 'name email registerNumber department')
      .populate('borrowRecord')
      .populate('waivedBy', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, fines, 'Fines retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark fine as paid
 * @route PATCH /api/v1/fines/:id/pay
 * @access Protected (Admin, Coordinator, Equipment Incharge)
 */
const payFine = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return errorResponse(res, 404, 'Fine record not found', 'NOT_FOUND');

    fine.status = 'Paid';
    fine.paidDate = new Date();
    await fine.save();

    await logAudit({
      user: req.user,
      action: 'PAY_FINE',
      module: 'Fines Management',
      description: `Marked fine ₹${fine.amount} as Paid for student ${fine.student}`,
      relatedRecordId: fine._id,
      req,
    });

    return successResponse(res, 200, fine, 'Fine marked as paid');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Waive fine
 * @route PATCH /api/v1/fines/:id/waive
 * @access Protected (Admin, Coordinator)
 */
const waiveFine = async (req, res, next) => {
  try {
    const { waivedReason } = req.body;
    const fine = await Fine.findById(req.params.id);
    if (!fine) return errorResponse(res, 404, 'Fine record not found', 'NOT_FOUND');

    fine.status = 'Waived';
    fine.waivedBy = req.user._id;
    fine.waivedReason = waivedReason || 'Waived by Sports Council Coordinator';
    await fine.save();

    await logAudit({
      user: req.user,
      action: 'WAIVE_FINE',
      module: 'Fines Management',
      description: `Waived fine ₹${fine.amount} for student ${fine.student}. Reason: ${fine.waivedReason}`,
      relatedRecordId: fine._id,
      req,
    });

    return successResponse(res, 200, fine, 'Fine waived successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFines,
  payFine,
  waiveFine,
};
