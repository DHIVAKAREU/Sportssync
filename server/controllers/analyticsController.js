const Player = require('../models/players.model');
const Equipment = require('../models/equipment.model');
const BorrowRecord = require('../models/borrowRecords.model');
const Tournament = require('../models/tournaments.model');
const Fine = require('../models/fines.model');
const Achievement = require('../models/achievements.model');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc Single endpoint returning role dashboard analytics via MongoDB aggregations (Section 20)
 * @route GET /api/v1/analytics/dashboard/:role
 * @access Protected
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const roleParam = (req.params.role || req.user?.role?.name || 'admin').toLowerCase();

    // Aggregation 1: Equipment borrowing trend by month
    const borrowTrends = await BorrowRecord.aggregate([
      {
        $group: {
          _id: { $month: '$requestDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregation 1b: Borrow status breakdown
    const borrowStats = await BorrowRecord.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregation 2: Fine totals by status
    const fineStats = await Fine.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregation 3: Player count by sport with lookup
    const playersBySport = await Player.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'sports',
          localField: '_id',
          foreignField: '_id',
          as: 'sportDoc',
        },
      },
      {
        $unwind: {
          path: '$sportDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: {
            _id: '$_id',
            name: { $ifNull: ['$sportDoc.name', 'Unassigned'] },
          },
          count: 1,
        },
      },
    ]);

    const totalPlayers = await Player.countDocuments({ status: 'approved' });
    const activeTournaments = await Tournament.countDocuments({ status: { $in: ['Registration Open', 'Ongoing'] } });
    const totalEquipmentIssued = await BorrowRecord.countDocuments({ status: 'Issued' });
    const lowStockCount = await Equipment.countDocuments({ availableQuantity: { $lte: 5 } });

    const payload = {
      role: roleParam,
      kpis: {
        totalPlayers,
        activeTournaments,
        totalEquipmentIssued,
        lowStockCount,
      },
      charts: {
        borrowTrends,
        borrowStats,
        fineStats,
        playersBySport,
      },
      borrowStats,
      playersBySport,
      borrowTrends,
      fineStats,
    };

    return successResponse(res, 200, payload, 'Dashboard analytics computed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
