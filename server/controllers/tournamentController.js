const Tournament = require('../models/tournaments.model');
const TournamentRegistration = require('../models/tournamentRegistrations.model');
const Fixture = require('../models/fixtures.model');
const Match = require('../models/matches.model');
const Team = require('../models/teams.model');
const Venue = require('../models/venues.model');
const { generateTournamentFixtures } = require('../services/fixtureGenerator');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// Seed tournament if empty
const seedTournamentsIfEmpty = async (userId) => {
  const count = await Tournament.countDocuments();
  if (count === 0) {
    console.log('Seeding initial tournament...');
    const sports = require('../models/sports.model');
    const bsk = await sports.findOne({ name: 'Basketball' });

    if (bsk) {
      await Tournament.create({
        name: 'Inter-Department Basketball Trophy 2026',
        sport: bsk._id,
        format: 'Knockout',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-05'),
        status: 'Registration Open',
        maxTeams: 16,
        createdBy: userId,
      });
    }
  }
};

/**
 * @desc Get all tournaments with search & filters
 * @route GET /api/v1/tournaments
 * @access Protected
 */
const getTournaments = async (req, res, next) => {
  try {
    if (req.user) {
      await seedTournamentsIfEmpty(req.user._id);
    }

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.format) query.format = req.query.format;
    if (req.query.sportId) query.sport = req.query.sportId;
    if (req.query.search) query.name = new RegExp(req.query.search, 'i');

    const tournaments = await Tournament.find(query)
      .populate('sport', 'name icon category')
      .populate('winner', 'name')
      .populate('runnerUp', 'name')
      .sort({ startDate: -1 });

    return successResponse(res, 200, tournaments, 'Tournaments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single tournament details
 * @route GET /api/v1/tournaments/:id
 * @access Protected
 */
const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('sport', 'name category icon')
      .populate('venues')
      .populate('winner', 'name')
      .populate('runnerUp', 'name');

    if (!tournament) {
      return errorResponse(res, 404, 'Tournament not found', 'NOT_FOUND');
    }

    const registrations = await TournamentRegistration.find({ tournament: tournament._id })
      .populate({
        path: 'team',
        populate: [
          { path: 'sport', select: 'name' },
          { path: 'coach', select: 'name email' },
          { path: 'captain', populate: { path: 'user', select: 'name' } },
        ],
      })
      .sort({ createdAt: 1 });

    return successResponse(res, 200, { tournament, registrations }, 'Tournament details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create tournament
 * @route POST /api/v1/tournaments
 * @access Protected (Admin, Coordinator)
 */
const createTournament = async (req, res, next) => {
  try {
    const { name, sportId, format, startDate, endDate, maxTeams, description, venues } = req.body;

    if (!name || !sportId || !startDate || !endDate) {
      return errorResponse(res, 400, 'Tournament name, sport, start date, and end date are required', 'MISSING_FIELDS');
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      sport: sportId,
      format: format || 'Knockout',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxTeams: maxTeams || 16,
      description: description || '',
      venues: venues || [],
      status: 'Registration Open',
      createdBy: req.user._id,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_TOURNAMENT',
      module: 'Tournaments',
      description: `Created tournament ${name} (${format})`,
      relatedRecordId: tournament._id,
      req,
    });

    const populated = await Tournament.findById(tournament._id).populate('sport', 'name icon');
    return successResponse(res, 201, populated, 'Tournament created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update tournament details & status
 * @route PUT /api/v1/tournaments/:id
 * @access Protected (Admin, Coordinator)
 */
const updateTournament = async (req, res, next) => {
  try {
    const { name, format, startDate, endDate, maxTeams, description, status, winnerId, runnerUpId } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return errorResponse(res, 404, 'Tournament not found', 'NOT_FOUND');
    }

    if (name) tournament.name = name.trim();
    if (format) tournament.format = format;
    if (startDate) tournament.startDate = new Date(startDate);
    if (endDate) tournament.endDate = new Date(endDate);
    if (maxTeams !== undefined) tournament.maxTeams = maxTeams;
    if (description !== undefined) tournament.description = description;
    if (status) tournament.status = status;
    if (winnerId) tournament.winner = winnerId;
    if (runnerUpId) tournament.runnerUp = runnerUpId;

    await tournament.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_TOURNAMENT',
      module: 'Tournaments',
      description: `Updated tournament details for ${tournament.name}`,
      relatedRecordId: tournament._id,
      req,
    });

    const updated = await Tournament.findById(tournament._id).populate('sport').populate('winner').populate('runnerUp');
    return successResponse(res, 200, updated, 'Tournament updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete tournament
 * @route DELETE /api/v1/tournaments/:id
 * @access Protected (Admin, Coordinator)
 */
const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return errorResponse(res, 404, 'Tournament not found', 'NOT_FOUND');

    tournament.status = 'Cancelled';
    await tournament.save();

    await logAudit({
      user: req.user,
      action: 'DELETE_TOURNAMENT',
      module: 'Tournaments',
      description: `Cancelled tournament ${tournament.name}`,
      relatedRecordId: tournament._id,
      req,
    });

    return successResponse(res, 200, null, 'Tournament cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Register team for tournament
 * @route POST /api/v1/tournaments/:id/register-team
 * @access Protected (Admin, Coordinator, Coach)
 */
const registerTeam = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const tournamentId = req.params.id;

    if (!teamId) {
      return errorResponse(res, 400, 'Team ID is required', 'MISSING_TEAM_ID');
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return errorResponse(res, 404, 'Tournament not found', 'NOT_FOUND');

    const team = await Team.findById(teamId);
    if (!team || !team.isActive) return errorResponse(res, 404, 'Team not found or inactive', 'TEAM_NOT_FOUND');

    // Sport compatibility check
    if (team.sport.toString() !== tournament.sport.toString()) {
      return errorResponse(res, 400, 'Team sport does not match tournament sport', 'SPORT_MISMATCH');
    }

    const existing = await TournamentRegistration.findOne({ tournament: tournamentId, team: teamId });
    if (existing) {
      return errorResponse(res, 400, 'Team is already registered for this tournament', 'DUPLICATE_REGISTRATION');
    }

    const registration = await TournamentRegistration.create({
      tournament: tournamentId,
      team: teamId,
      registeredBy: req.user._id,
      status: 'Approved',
    });

    const Notification = require('../models/notifications.model');
    if (team.coach) {
      await Notification.create({
        recipient: team.coach,
        title: 'Tournament Registration Confirmed',
        message: `Your team ${team.name} has been registered for ${tournament.name}.`,
        type: 'tournament',
        link: '/tournaments',
      });
    }

    await logAudit({
      user: req.user,
      action: 'REGISTER_TEAM_TOURNAMENT',
      module: 'Tournaments',
      description: `Registered team ${team.name} for tournament ${tournament.name}`,
      relatedRecordId: registration._id,
      req,
    });

    const populated = await TournamentRegistration.findById(registration._id).populate('team', 'name');
    return successResponse(res, 201, populated, 'Team registered for tournament successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Auto-generate fixtures for tournament (Section 18 Algorithm)
 * @route POST /api/v1/tournaments/:id/generate-fixtures
 * @access Protected (Admin, Coordinator)
 */
const generateFixtures = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return errorResponse(res, 404, 'Tournament not found', 'NOT_FOUND');

    const registrations = await TournamentRegistration.find({ tournament: tournament._id, status: 'Approved' });
    const teamIds = registrations.map(r => r.team);

    if (teamIds.length < 2) {
      return errorResponse(res, 400, 'At least 2 approved registered teams are required to generate fixtures', 'INSUFFICIENT_TEAMS');
    }

    const venues = await Venue.find({ maintenanceStatus: 'Available', isActive: true });
    if (venues.length === 0) {
      return errorResponse(res, 400, 'No active venues available for scheduling matches', 'NO_VENUES');
    }

    const fixtures = await generateTournamentFixtures({
      tournamentId: tournament._id,
      format: tournament.format,
      teams: teamIds,
      venues,
      startDate: tournament.startDate,
      restHours: req.body.restHours || 4,
    });

    tournament.status = 'Ongoing';
    await tournament.save();

    await logAudit({
      user: req.user,
      action: 'GENERATE_FIXTURES',
      module: 'Tournaments',
      description: `Generated ${fixtures.length} fixtures for tournament ${tournament.name}`,
      relatedRecordId: tournament._id,
      req,
    });

    return successResponse(res, 200, fixtures, `Generated ${fixtures.length} tournament fixtures successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get tournament fixtures and matches
 * @route GET /api/v1/tournaments/:id/fixtures
 * @access Protected
 */
const getFixtures = async (req, res, next) => {
  try {
    const fixtures = await Fixture.find({ tournament: req.params.id })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('venue', 'name location type')
      .sort({ matchNumber: 1 });

    const fixtureIds = fixtures.map(f => f._id);
    const matches = await Match.find({ fixture: { $in: fixtureIds } }).populate('winner', 'name');

    const result = fixtures.map(f => {
      const matchObj = matches.find(m => m.fixture.toString() === f._id.toString());
      return {
        ...f.toObject(),
        match: matchObj || null,
      };
    });

    return successResponse(res, 200, result, 'Tournament fixtures retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Manual Fixture Reschedule (reschedule Date, Time, Venue)
 * @route PUT /api/v1/tournaments/fixtures/:fixtureId
 * @access Protected (Admin, Coordinator)
 */
const updateFixture = async (req, res, next) => {
  try {
    const { scheduledDate, scheduledTime, venueId, round } = req.body;
    const fixture = await Fixture.findById(req.params.fixtureId);

    if (!fixture) return errorResponse(res, 404, 'Fixture not found', 'NOT_FOUND');

    if (scheduledDate) fixture.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) fixture.scheduledTime = scheduledTime;
    if (venueId) fixture.venue = venueId;
    if (round) fixture.round = round;
    fixture.status = 'Rescheduled';
    fixture.generatedBy = 'Manual';

    await fixture.save();

    await logAudit({
      user: req.user,
      action: 'RESCHEDULE_FIXTURE',
      module: 'Tournaments',
      description: `Manually rescheduled fixture match #${fixture.matchNumber}`,
      relatedRecordId: fixture._id,
      req,
    });

    const updated = await Fixture.findById(fixture._id).populate('teamA').populate('teamB').populate('venue');
    return successResponse(res, 200, updated, 'Fixture rescheduled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update Match Result & Scores
 * @route PATCH /api/v1/tournaments/fixtures/:fixtureId/result
 * @access Protected (Admin, Coordinator, Coach)
 */
const updateMatchResult = async (req, res, next) => {
  try {
    const { teamAScore, teamBScore, winnerId, matchDetails } = req.body;
    const { fixtureId } = req.params;

    let match = await Match.findOne({ fixture: fixtureId });
    if (!match) {
      match = new Match({ fixture: fixtureId });
    }

    match.teamAScore = Number(teamAScore) || 0;
    match.teamBScore = Number(teamBScore) || 0;
    match.winner = winnerId || (match.teamAScore > match.teamBScore ? match.teamA : match.teamB);
    match.status = 'Completed';
    match.matchDetails = matchDetails || '';
    match.updatedBy = req.user._id;
    await match.save();

    await Fixture.findByIdAndUpdate(fixtureId, { status: 'Completed' });

    await logAudit({
      user: req.user,
      action: 'UPDATE_MATCH_RESULT',
      module: 'Tournaments',
      description: `Updated match score (${match.teamAScore} - ${match.teamBScore}) for fixture ${fixtureId}`,
      relatedRecordId: match._id,
      req,
    });

    const populatedMatch = await Match.findById(match._id).populate('winner', 'name');
    return successResponse(res, 200, populatedMatch, 'Match result recorded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerTeam,
  generateFixtures,
  getFixtures,
  updateFixture,
  updateMatchResult,
};
