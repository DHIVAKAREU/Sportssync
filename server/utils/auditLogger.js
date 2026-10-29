const AuditLog = require('../models/auditLogs.model');

const logAudit = async ({ user, action, module: modName, description, relatedRecordId, req }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1';
    await AuditLog.create({
      user: user._id || user,
      action,
      module: modName,
      description,
      relatedRecordId: relatedRecordId || null,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = { logAudit };
