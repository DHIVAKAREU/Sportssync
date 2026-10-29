const mongoose = require('mongoose');
const Attendance = require('../models/attendance.model');
const Player = require('../models/players.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc Bulk mark attendance for session (FR-ATT-1: Compound unique index prevents duplicate marking)
 * @route POST /api/v1/attendance/bulk
 * @access Protected (Coach, Coordinator, Admin)
 */
const markBulkAttendance = async (req, res, next) => {
  try {
    const { sportId, date, session, records } = req.body;

    if (!sportId || !date || !session || !Array.isArray(records)) {
      return errorResponse(res, 400, 'Please provide sportId, date, session, and records array', 'INVALID_INPUT');
    }

    const attendanceDate = new Date(date);

    const operations = records.map((rec) => ({
      updateOne: {
        filter: {
          player: rec.playerId,
          sport: sportId,
          date: attendanceDate,
          session,
        },
        update: {
          $set: {
            status: rec.status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return successResponse(res, 200, {}, `Attendance marked for ${records.length} players`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get attendance logs (Students are strictly restricted to their own attendance records)
 * @route GET /api/v1/attendance
 * @access Protected
 */
const getAttendance = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.sportId) query.sport = req.query.sportId;
    if (req.query.date) query.date = new Date(req.query.date);
    if (req.query.session) query.session = req.query.session;

    // RBAC: If student, strictly restrict to their own player records
    const userRole = (
      req.user?.role?.name ||
      (typeof req.user?.role === 'string' ? req.user.role : '')
    ).toLowerCase();

    if (userRole === 'student') {
      const studentPlayers = await Player.find({ user: req.user._id }).select('_id');
      const playerIds = studentPlayers.map((p) => p._id);
      query.player = { $in: playerIds };
    } else if (req.query.playerId) {
      query.player = req.query.playerId;
    }

    const logs = await Attendance.find(query)
      .populate({
        path: 'player',
        populate: { path: 'user', select: 'name registerNumber' },
      })
      .populate('sport', 'name')
      .sort({ date: -1 });

    return successResponse(res, 200, logs, 'Attendance logs retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get attendance statistics and percentage per player
 * @route GET /api/v1/attendance/stats
 * @access Protected
 */
const getAttendanceStats = async (req, res, next) => {
  try {
    const { sportId, playerId } = req.query;
    const match = {};

    if (sportId && mongoose.Types.ObjectId.isValid(sportId)) {
      match.sport = new mongoose.Types.ObjectId(sportId);
    }

    // RBAC: If student, restrict statistics aggregation to their own player IDs
    const userRole = (
      req.user?.role?.name ||
      (typeof req.user?.role === 'string' ? req.user.role : '')
    ).toLowerCase();

    if (userRole === 'student') {
      const studentPlayers = await Player.find({ user: req.user._id }).select('_id');
      const playerIds = studentPlayers.map((p) => p._id);
      match.player = { $in: playerIds };
    } else if (playerId && mongoose.Types.ObjectId.isValid(playerId)) {
      match.player = new mongoose.Types.ObjectId(playerId);
    }

    const stats = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { player: '$player', sport: '$sport' },
          totalSessions: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [
                {
                  $in: [{ $toLower: { $ifNull: ['$status', ''] } }, ['present']],
                },
                1,
                0,
              ],
            },
          },
          absentCount: {
            $sum: {
              $cond: [
                {
                  $in: [{ $toLower: { $ifNull: ['$status', ''] } }, ['absent']],
                },
                1,
                0,
              ],
            },
          },
          excusedCount: {
            $sum: {
              $cond: [
                {
                  $in: [{ $toLower: { $ifNull: ['$status', ''] } }, ['excused']],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          player: '$_id.player',
          sport: '$_id.sport',
          totalSessions: 1,
          presentCount: 1,
          absentCount: 1,
          excusedCount: 1,
          attendancePercentage: {
            $cond: [
              { $gt: ['$totalSessions', 0] },
              { $multiply: [{ $divide: ['$presentCount', '$totalSessions'] }, 100] },
              0,
            ],
          },
        },
      },
    ]);

    return successResponse(res, 200, stats, 'Attendance statistics retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markBulkAttendance,
  getAttendance,
  getAttendanceStats,
};
