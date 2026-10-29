const Equipment = require('../models/equipment.model');
const BorrowRecord = require('../models/borrowRecords.model');
const Fine = require('../models/fines.model');
const Tournament = require('../models/tournaments.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc Export report data as CSV
 * @route GET /api/v1/reports/export/:type or GET /api/v1/reports/export?type=...
 * @access Protected (Admin, Coordinator, Equipment Incharge)
 */
const exportReport = async (req, res, next) => {
  try {
    const rawType = (req.params.type || req.query.type || 'equipment').toLowerCase();

    if (rawType === 'equipment' || rawType === 'inventory') {
      const items = await Equipment.find({ isActive: true }).populate('category', 'name');
      const csvHeader = 'Code,Name,Category,Total,Available,Issued,Damaged,Lost,Condition\n';
      const csvRows = items.map(i =>
        `"${i.equipmentCode || ''}","${i.name || ''}","${i.category?.name || ''}",${i.totalQuantity || 0},${i.availableQuantity || 0},${i.issuedQuantity || 0},${i.damagedQuantity || 0},${i.lostQuantity || 0},"${i.condition || 'Good'}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.csv');
      return res.status(200).send(csvHeader + csvRows);
    }

    if (rawType === 'borrow') {
      const records = await BorrowRecord.find().populate('equipment', 'name equipmentCode').populate('student', 'name registerNumber');
      const csvHeader = 'Student,RegisterNumber,Equipment,Quantity,Status,RequestDate,DueDate,ReturnDate\n';
      const csvRows = records.map(r =>
        `"${r.student?.name || ''}","${r.student?.registerNumber || ''}","${r.equipment?.name || ''}",${r.quantity || 1},"${r.status}","${r.requestDate ? new Date(r.requestDate).toISOString().split('T')[0] : ''}","${r.dueDate ? new Date(r.dueDate).toISOString().split('T')[0] : ''}","${r.returnDate ? new Date(r.returnDate).toISOString().split('T')[0] : ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=borrow_report.csv');
      return res.status(200).send(csvHeader + csvRows);
    }

    if (rawType === 'fines') {
      const fines = await Fine.find().populate('student', 'name registerNumber');
      const csvHeader = 'Student,RegisterNumber,Reason,OverdueDays,Amount,Status,PaidDate\n';
      const csvRows = fines.map(f =>
        `"${f.student?.name || ''}","${f.student?.registerNumber || ''}","${f.reason || ''}",${f.overdueDays || 0},${f.amount || 0},"${f.status}","${f.paidDate ? new Date(f.paidDate).toISOString().split('T')[0] : ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=fines_report.csv');
      return res.status(200).send(csvHeader + csvRows);
    }

    if (rawType === 'tournaments') {
      const tournaments = await Tournament.find().populate('sport', 'name').populate('winner', 'name');
      const csvHeader = 'Tournament,Sport,Format,Status,MaxTeams,StartDate,EndDate,Winner\n';
      const csvRows = tournaments.map(t =>
        `"${t.name || ''}","${t.sport?.name || ''}","${t.format || ''}","${t.status || ''}",${t.maxTeams || 0},"${t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : ''}","${t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : ''}","${t.winner?.name || 'TBD'}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=tournaments_report.csv');
      return res.status(200).send(csvHeader + csvRows);
    }

    return errorResponse(res, 400, `Unknown report type: ${rawType}`, 'INVALID_REPORT_TYPE');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportReport,
};
