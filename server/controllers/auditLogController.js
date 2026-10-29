const AuditLog = require('../models/auditLogs.model');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc Get system audit logs (Admin only)
 * @route GET /api/v1/audit-logs
 * @access Protected (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments();

    return successResponse(res, 200, logs, 'Audit logs retrieved', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
};
