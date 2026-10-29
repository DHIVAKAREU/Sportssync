const Team = require('../models/teams.model');
const TeamMember = require('../models/teamMembers.model');
const Player = require('../models/players.model');
const User = require('../models/users.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Get all active teams
 * @route GET /api/v1/teams
 * @access Protected
 */
const getTeams = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.sportId) query.sport = req.query.sportId;

    if (req.query.search) {
      query.name = new RegExp(req.query.search, 'i');
    }

    const teams = await Team.find(query)
      .populate('sport', 'name category icon')
      .populate('coach', 'name email department phone')
      .populate({
        path: 'captain',
        populate: { path: 'user', select: 'name email registerNumber department' },
      })
      .sort({ name: 1 });

    return successResponse(res, 200, teams, 'Teams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single team details & full roster members
 * @route GET /api/v1/teams/:id
 * @access Protected
 */
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('sport')
      .populate('coach', 'name email phone department')
      .populate({
        path: 'captain',
        populate: { path: 'user', select: 'name email registerNumber department year' },
      });

    if (!team) return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');

    const members = await TeamMember.find({ team: team._id, isActive: true })
      .populate({
        path: 'player',
        populate: { path: 'user', select: 'name email registerNumber department year phone' },
      })
      .sort({ role: 1, createdAt: 1 });

    return successResponse(res, 200, { team, members }, 'Team details and roster retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new team
 * @route POST /api/v1/teams
 * @access Protected (Admin, Coordinator, Coach)
 */
const createTeam = async (req, res, next) => {
  try {
    const { name, sportId, coachId, season } = req.body;

    if (!name || !sportId) {
      return errorResponse(res, 400, 'Team name and sport choice are required', 'MISSING_FIELDS');
    }

    const currentSeason = season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // Check duplicate team name in same sport and season
    const existing = await Team.findOne({
      name: new RegExp(`^${name.trim()}$`, 'i'),
      sport: sportId,
      season: currentSeason,
    });

    if (existing) {
      return errorResponse(res, 400, `Team "${name}" already exists for this sport in season ${currentSeason}`, 'DUPLICATE_TEAM');
    }

    const team = await Team.create({
      name: name.trim(),
      sport: sportId,
      coach: coachId || req.user._id,
      season: currentSeason,
      isActive: true,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_TEAM',
      module: 'Team Management',
      description: `Created team ${name} for season ${team.season}`,
      relatedRecordId: team._id,
      req,
    });

    const populated = await Team.findById(team._id).populate('sport').populate('coach', 'name email');
    return successResponse(res, 201, populated, 'Team created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update team details
 * @route PUT /api/v1/teams/:id
 * @access Protected (Admin, Coordinator, Coach)
 */
const updateTeam = async (req, res, next) => {
  try {
    const { name, coachId, season } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');
    }

    if (name) team.name = name.trim();
    if (coachId) team.coach = coachId;
    if (season) team.season = season;

    await team.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_TEAM',
      module: 'Team Management',
      description: `Updated team details for ${team.name}`,
      relatedRecordId: team._id,
      req,
    });

    const updated = await Team.findById(team._id).populate('sport').populate('coach', 'name email');
    return successResponse(res, 200, updated, 'Team details updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete team
 * @route DELETE /api/v1/teams/:id
 * @access Protected (Admin, Coordinator)
 */
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');
    }

    team.isActive = false;
    await team.save();

    await TeamMember.updateMany({ team: team._id }, { isActive: false });

    await logAudit({
      user: req.user,
      action: 'DELETE_TEAM',
      module: 'Team Management',
      description: `Deleted team ${team.name}`,
      relatedRecordId: team._id,
      req,
    });

    return successResponse(res, 200, null, 'Team deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Add player to team roster (Enforces approved status and sport match)
 * @route POST /api/v1/teams/:id/members
 * @access Protected (Admin, Coordinator, Coach)
 */
const addTeamMember = async (req, res, next) => {
  try {
    const { playerId, role } = req.body;
    const teamId = req.params.id;

    if (!playerId) {
      return errorResponse(res, 400, 'playerId is required', 'MISSING_PLAYER_ID');
    }

    const team = await Team.findById(teamId);
    if (!team) return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');

    const player = await Player.findById(playerId).populate('sport');
    if (!player) return errorResponse(res, 404, 'Player registration record not found', 'NOT_FOUND');

    // Validation: Must be approved player for the team's sport
    if (player.status !== 'approved') {
      return errorResponse(
        res,
        400,
        `Cannot add player to roster: Registration status is '${player.status}'. Must be 'approved'.`,
        'UNAPPROVED_PLAYER'
      );
    }

    if (player.sport._id.toString() !== team.sport.toString()) {
      return errorResponse(
        res,
        400,
        `Sport mismatch: Player is registered for ${player.sport.name}, which does not match team sport.`,
        'SPORT_MISMATCH'
      );
    }

    let member = await TeamMember.findOne({ team: teamId, player: playerId });
    if (member) {
      if (member.isActive) {
        return errorResponse(res, 400, 'Player is already an active member of this team roster', 'DUPLICATE_ROSTER');
      }
      member.isActive = true;
      member.role = role || 'member';
      await member.save();
    } else {
      member = await TeamMember.create({
        team: teamId,
        player: playerId,
        role: role || 'member',
        isActive: true,
      });
    }

    // Set as captain if specified
    if (role === 'captain') {
      team.captain = playerId;
      await team.save();
    }

    await logAudit({
      user: req.user,
      action: 'ADD_TEAM_MEMBER',
      module: 'Team Management',
      description: `Added player ${playerId} to team ${team.name} as ${role || 'member'}`,
      relatedRecordId: team._id,
      req,
    });

    return successResponse(res, 200, member, 'Player added to team roster successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Remove player from team roster
 * @route DELETE /api/v1/teams/:id/members/:playerId
 * @access Protected (Admin, Coordinator, Coach)
 */
const removeTeamMember = async (req, res, next) => {
  try {
    const { id: teamId, playerId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');

    const member = await TeamMember.findOne({ team: teamId, player: playerId });
    if (!member) {
      return errorResponse(res, 404, 'Player is not a member of this team', 'NOT_FOUND');
    }

    member.isActive = false;
    await member.save();

    // If this player was the captain, clear captain field
    if (team.captain && team.captain.toString() === playerId) {
      team.captain = undefined;
      await team.save();
    }

    await logAudit({
      user: req.user,
      action: 'REMOVE_TEAM_MEMBER',
      module: 'Team Management',
      description: `Removed player ${playerId} from team ${team.name}`,
      relatedRecordId: team._id,
      req,
    });

    return successResponse(res, 200, null, 'Player removed from team roster successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reassign team captain
 * @route PATCH /api/v1/teams/:id/captain
 * @access Protected (Admin, Coordinator, Coach)
 */
const setCaptain = async (req, res, next) => {
  try {
    const { playerId } = req.body;
    const teamId = req.params.id;

    if (!playerId) {
      return errorResponse(res, 400, 'playerId is required', 'MISSING_PLAYER_ID');
    }

    const team = await Team.findById(teamId);
    if (!team) return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');

    const member = await TeamMember.findOne({ team: teamId, player: playerId, isActive: true });
    if (!member) {
      return errorResponse(res, 400, 'Player must be an active member of the team roster to be appointed Captain', 'MEMBER_NOT_FOUND');
    }

    // Reset previous captain role
    if (team.captain) {
      await TeamMember.updateOne({ team: teamId, player: team.captain }, { role: 'member' });
    }

    team.captain = playerId;
    await team.save();

    member.role = 'captain';
    await member.save();

    await logAudit({
      user: req.user,
      action: 'REASSIGN_CAPTAIN',
      module: 'Team Management',
      description: `Reassigned captain of ${team.name} to player ${playerId}`,
      relatedRecordId: team._id,
      req,
    });

    const updated = await Team.findById(team._id)
      .populate('sport')
      .populate('coach')
      .populate({
        path: 'captain',
        populate: { path: 'user', select: 'name email' },
      });

    return successResponse(res, 200, updated, 'Team captain reassigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reassign team coach
 * @route PATCH /api/v1/teams/:id/coach
 * @access Protected (Admin, Coordinator)
 */
const assignCoach = async (req, res, next) => {
  try {
    const { coachId } = req.body;
    const teamId = req.params.id;

    if (!coachId) {
      return errorResponse(res, 400, 'coachId is required', 'MISSING_COACH_ID');
    }

    const coachUser = await User.findById(coachId);
    if (!coachUser) {
      return errorResponse(res, 404, 'Coach user account not found', 'NOT_FOUND');
    }

    const team = await Team.findByIdAndUpdate(teamId, { coach: coachId }, { new: true })
      .populate('sport')
      .populate('coach', 'name email department');

    if (!team) return errorResponse(res, 404, 'Team not found', 'NOT_FOUND');

    await logAudit({
      user: req.user,
      action: 'ASSIGN_COACH',
      module: 'Team Management',
      description: `Assigned coach ${coachUser.name} to team ${team.name}`,
      relatedRecordId: team._id,
      req,
    });

    return successResponse(res, 200, team, 'Team coach assigned successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  setCaptain,
  assignCoach,
};
