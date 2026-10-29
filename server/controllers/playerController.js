const Player = require('../models/players.model');
const Sport = require('../models/sports.model');
const TeamMember = require('../models/teamMembers.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Student registers for a sport
 * @route POST /api/v1/players
 * @access Protected (Student, Admin, Coordinator)
 */
const registerPlayer = async (req, res, next) => {
  try {
    const { sportId, position, jerseyNumber, documents } = req.body;
    const userId = req.user._id;

    if (!sportId) {
      return errorResponse(res, 400, 'Sport ID is required', 'MISSING_SPORT_ID');
    }

    const sport = await Sport.findById(sportId);
    if (!sport || !sport.isActive) {
      return errorResponse(res, 404, 'Selected sport is not found or inactive', 'SPORT_NOT_FOUND');
    }

    // Fetch all active or pending registrations for this student
    const existingRegistrations = await Player.find({
      user: userId,
      status: { $ne: 'rejected' },
    }).populate('sport');

    // 1. Check duplicate registration for the exact same sport
    const duplicate = existingRegistrations.find(
      (r) => r.sport && r.sport._id.toString() === sportId.toString()
    );
    if (duplicate) {
      return errorResponse(
        res,
        400,
        `You have already registered for ${sport.name}. Current status: ${duplicate.status.toUpperCase()}`,
        'DUPLICATE_REGISTRATION'
      );
    }

    // 2. Enforce 1 Team sport and 1 Individual sport quota per student
    const sportCategory = sport.category || 'Team';
    const existingInCategory = existingRegistrations.find(
      (r) => r.sport && r.sport.category === sportCategory
    );

    if (existingInCategory) {
      return errorResponse(
        res,
        400,
        `Registration limit reached: Students are allowed to participate in only 1 ${sportCategory} sport. You already have an active registration for ${existingInCategory.sport.name} (${existingInCategory.status.toUpperCase()}).`,
        'CATEGORY_LIMIT_REACHED'
      );
    }

    const player = await Player.create({
      user: userId,
      sport: sportId,
      position: position || 'Player',
      jerseyNumber: jerseyNumber || null,
      documents: documents || [],
      status: 'pending',
    });

    await logAudit({
      user: req.user,
      action: 'REGISTER_FOR_SPORT',
      module: 'Player Management',
      description: `Registered for sport ${sport.name}`,
      relatedRecordId: player._id,
      req,
    });

    const populated = await Player.findById(player._id)
      .populate('user', 'name email registerNumber department year phone')
      .populate('sport', 'name category icon');

    return successResponse(res, 201, populated, 'Sports registration submitted successfully. Pending staff review.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all player registrations (Staff view)
 * @route GET /api/v1/players
 * @access Protected (Admin, Coordinator, Coach)
 */
const getPlayers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.sportId) query.sport = req.query.sportId;

    // Optional search by student name/email/regNumber via user populate query
    let players = await Player.find(query)
      .populate('user', 'name email registerNumber department year phone')
      .populate('sport', 'name category icon')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      players = players.filter(
        (p) =>
          (p.user && (searchRegex.test(p.user.name) || searchRegex.test(p.user.email) || searchRegex.test(p.user.registerNumber))) ||
          (p.sport && searchRegex.test(p.sport.name))
      );
    }

    const total = players.length;
    const paginated = players.slice(skip, skip + limit);

    return successResponse(res, 200, paginated, 'Player registrations retrieved successfully', {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single player profile details
 * @route GET /api/v1/players/:id
 * @access Protected
 */
const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('user', 'name email registerNumber department year phone')
      .populate('sport', 'name category description icon')
      .populate('approvedBy', 'name email');

    if (!player) {
      return errorResponse(res, 404, 'Player registration profile not found', 'NOT_FOUND');
    }

    // Fetch team memberships
    const teamMemberships = await TeamMember.find({ player: player._id, isActive: true })
      .populate('team', 'name season')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, { player, teamMemberships }, 'Player profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get my sport registrations
 * @route GET /api/v1/players/me
 * @access Protected (Student)
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const players = await Player.find({ user: req.user._id })
      .populate('sport', 'name category description icon')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, players, 'My sport registrations retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update player registration profile details
 * @route PUT /api/v1/players/:id
 * @access Protected
 */
const updatePlayerProfile = async (req, res, next) => {
  try {
    const { position, jerseyNumber, documents } = req.body;
    const player = await Player.findById(req.params.id);

    if (!player) {
      return errorResponse(res, 404, 'Player registration not found', 'NOT_FOUND');
    }

    if (position !== undefined) player.position = position;
    if (jerseyNumber !== undefined) player.jerseyNumber = jerseyNumber;
    if (documents !== undefined) player.documents = documents;

    await player.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_PLAYER_PROFILE',
      module: 'Player Management',
      description: `Updated profile details for player registration ID ${player._id}`,
      relatedRecordId: player._id,
      req,
    });

    const updated = await Player.findById(player._id)
      .populate('user', 'name email registerNumber department year')
      .populate('sport', 'name category');

    return successResponse(res, 200, updated, 'Player profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Approve player registration
 * @route PATCH /api/v1/players/:id/approve
 * @access Protected (Admin, Coordinator, Coach)
 */
const approvePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id).populate('user').populate('sport');
    if (!player) return errorResponse(res, 404, 'Player registration not found', 'NOT_FOUND');

    player.status = 'approved';
    player.approvedBy = req.user._id;
    player.rejectionReason = undefined;
    await player.save();

    const Notification = require('../models/notifications.model');
    if (player.user) {
      await Notification.create({
        recipient: player.user._id || player.user,
        title: 'Player Registration Approved',
        message: `Congratulations! Your sports registration for ${player.sport?.name || 'sport'} has been approved.`,
        type: 'registration',
        link: '/players/register',
      });
    }

    await logAudit({
      user: req.user,
      action: 'APPROVE_PLAYER',
      module: 'Player Management',
      description: `Approved ${player.user?.name || 'student'} for ${player.sport?.name || 'sport'}`,
      relatedRecordId: player._id,
      req,
    });

    return successResponse(res, 200, player, 'Player registration approved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reject player registration
 * @route PATCH /api/v1/players/:id/reject
 * @access Protected (Admin, Coordinator, Coach)
 */
const rejectPlayer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const player = await Player.findById(req.params.id).populate('user').populate('sport');
    if (!player) return errorResponse(res, 404, 'Player registration not found', 'NOT_FOUND');

    player.status = 'rejected';
    player.approvedBy = req.user._id;
    player.rejectionReason = reason || 'Registration criteria not met';
    await player.save();

    const Notification = require('../models/notifications.model');
    if (player.user) {
      await Notification.create({
        recipient: player.user._id || player.user,
        title: 'Player Registration Update',
        message: `Your registration for ${player.sport?.name || 'sport'} was not approved. Reason: ${player.rejectionReason}`,
        type: 'registration',
        link: '/players/register',
      });
    }

    await logAudit({
      user: req.user,
      action: 'REJECT_PLAYER',
      module: 'Player Management',
      description: `Rejected ${player.user?.name || 'student'} for ${player.sport?.name || 'sport'}. Reason: ${player.rejectionReason}`,
      relatedRecordId: player._id,
      req,
    });

    return successResponse(res, 200, player, 'Player registration rejected');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete player registration
 * @route DELETE /api/v1/players/:id
 * @access Protected (Admin, Coordinator)
 */
const deletePlayerRegistration = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      return errorResponse(res, 404, 'Player registration not found', 'NOT_FOUND');
    }

    // Deactivate from any team rosters
    await TeamMember.updateMany({ player: req.params.id }, { isActive: false });

    await logAudit({
      user: req.user,
      action: 'DELETE_PLAYER_REGISTRATION',
      module: 'Player Management',
      description: `Deleted player registration ${req.params.id}`,
      relatedRecordId: req.params.id,
      req,
    });

    return successResponse(res, 200, null, 'Player registration deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPlayer,
  getPlayers,
  getPlayerById,
  getMyRegistrations,
  updatePlayerProfile,
  approvePlayer,
  rejectPlayer,
  deletePlayerRegistration,
};
