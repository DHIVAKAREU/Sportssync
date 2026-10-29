const Achievement = require('../models/achievements.model');
const Player = require('../models/players.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Get all achievements (FR-ACH-2: Only verified achievements shown publicly unless requested by staff)
 * @route GET /api/v1/achievements
 * @access Public / Protected
 */
const getAchievements = async (req, res, next) => {
  try {
    const query = {};

    const userRole = req.user?.role?.name?.toLowerCase() || '';
    if (userRole === 'student') {
      query.status = 'verified';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.sportId) query.sport = req.query.sportId;
    if (req.query.level) query.level = req.query.level;

    const achievements = await Achievement.find(query)
      .populate({
        path: 'player',
        populate: { path: 'user', select: 'name email registerNumber department' },
      })
      .populate('sport', 'name icon')
      .populate('verifiedBy', 'name')
      .sort({ year: -1, createdAt: -1 });

    return successResponse(res, 200, achievements, 'Achievements retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Submit an achievement (FR-ACH-1: Student submits unverified; Staff submits verified)
 * @route POST /api/v1/achievements
 * @access Protected
 */
const submitAchievement = async (req, res, next) => {
  try {
    const { playerId, sportId, title, competition, level, year, position, medal, description, certificate } = req.body;

    const userRole = req.user.role.name.toLowerCase();
    const isStaff = ['admin', 'coordinator', 'coach'].includes(userRole);

    let targetPlayerId = playerId || null;
    if (userRole === 'student') {
      const studentPlayer = await Player.findOne({ user: req.user._id, sport: sportId, status: 'approved' });
      if (!studentPlayer) {
        return errorResponse(res, 400, 'You must be an approved player in this sport to submit achievements', 'NOT_APPROVED_PLAYER');
      }
      targetPlayerId = studentPlayer._id;
    } else if (!targetPlayerId) {
      // If staff didn't specify player, optionally associate with an approved player in that sport if one exists
      const anyPlayer = await Player.findOne({ sport: sportId, status: 'approved' }) || await Player.findOne({ sport: sportId });
      if (anyPlayer) {
        targetPlayerId = anyPlayer._id;
      }
    }

    const achievement = await Achievement.create({
      player: targetPlayerId || undefined,
      sport: sportId,
      title,
      competition,
      level,
      year: year || new Date().getFullYear(),
      position,
      medal: medal || 'None',
      description,
      certificate,
      status: isStaff ? 'verified' : 'pending',
      verifiedBy: isStaff ? req.user._id : undefined,
    });

    const populated = await Achievement.findById(achievement._id)
      .populate({ path: 'player', populate: { path: 'user', select: 'name' } })
      .populate('sport', 'name');

    return successResponse(res, 201, populated, isStaff ? 'Achievement added & verified' : 'Achievement submitted for verification');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify an achievement
 * @route PATCH /api/v1/achievements/:id/verify
 * @access Protected (Admin, Coordinator, Coach)
 */
const verifyAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return errorResponse(res, 404, 'Achievement not found', 'NOT_FOUND');

    achievement.status = 'verified';
    achievement.verifiedBy = req.user._id;
    await achievement.save();

    await logAudit({
      user: req.user,
      action: 'VERIFY_ACHIEVEMENT',
      module: 'Achievements',
      description: `Verified achievement: ${achievement.title}`,
      relatedRecordId: achievement._id,
      req,
    });

    return successResponse(res, 200, achievement, 'Achievement verified successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an achievement
 * @route PUT /api/v1/achievements/:id
 * @access Protected (Admin, Coordinator, Coach)
 */
const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return errorResponse(res, 404, 'Achievement not found', 'NOT_FOUND');

    const fields = ['title', 'competition', 'level', 'year', 'position', 'medal', 'description', 'certificate', 'status'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) achievement[field] = req.body[field];
    });

    await achievement.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_ACHIEVEMENT',
      module: 'Achievements',
      description: `Updated achievement: ${achievement.title}`,
      relatedRecordId: achievement._id,
      req,
    });

    return successResponse(res, 200, achievement, 'Achievement updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete an achievement
 * @route DELETE /api/v1/achievements/:id
 * @access Protected (Admin, Coordinator, Coach)
 */
const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return errorResponse(res, 404, 'Achievement not found', 'NOT_FOUND');

    await achievement.deleteOne();

    await logAudit({
      user: req.user,
      action: 'DELETE_ACHIEVEMENT',
      module: 'Achievements',
      description: `Deleted achievement: ${achievement.title}`,
      relatedRecordId: achievement._id,
      req,
    });

    return successResponse(res, 200, {}, 'Achievement deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAchievements,
  submitAchievement,
  verifyAchievement,
  updateAchievement,
  deleteAchievement,
};
