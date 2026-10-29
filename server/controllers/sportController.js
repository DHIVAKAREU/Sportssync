const Sport = require('../models/sports.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// Auto-seed sports catalog if empty
const seedSportsIfEmpty = async (userId) => {
  const count = await Sport.countDocuments();
  if (count === 0) {
    console.log('Seeding initial sports catalog...');
    await Sport.insertMany([
      { name: 'Basketball', category: 'Team', description: '5v5 full court basketball', icon: 'dribble', createdBy: userId },
      { name: 'Football', category: 'Team', description: '11v11 Association Football', icon: 'circle-dot', createdBy: userId },
      { name: 'Badminton', category: 'Individual', description: 'Singles and Doubles Racquet Sport', icon: 'trophy', createdBy: userId },
      { name: 'Cricket', category: 'Team', description: 'T20 & One Day Cricket Matches', icon: 'target', createdBy: userId },
      { name: 'Volleyball', category: 'Team', description: '6v6 Indoor Court Volleyball', icon: 'volleyball', createdBy: userId },
      { name: 'Athletics', category: 'Individual', description: 'Track & Field sprint and long distance events', icon: 'activity', createdBy: userId },
    ]);
  }
};

/**
 * @desc Get sports catalog with filters
 * @route GET /api/v1/sports
 * @access Protected / Authenticated
 */
const getSports = async (req, res, next) => {
  try {
    if (req.user) {
      await seedSportsIfEmpty(req.user._id);
    }

    const query = {};

    // Filter by isActive status if requested (e.g. all=true shows inactive as well for admins/coordinators)
    if (req.query.all === 'true' || req.query.status === 'all') {
      // return both active and inactive
    } else if (req.query.status === 'inactive') {
      query.isActive = false;
    } else if (req.query.status === 'active') {
      query.isActive = true;
    } else if (!req.query.all) {
      // Default to active sports for general listing unless all=true is passed
      query.isActive = true;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.name = new RegExp(req.query.search, 'i');
    }

    const sports = await Sport.find(query).sort({ name: 1 });
    return successResponse(res, 200, sports, 'Sports catalog retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get sport details by ID
 * @route GET /api/v1/sports/:id
 * @access Protected
 */
const getSportById = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return errorResponse(res, 404, 'Sport not found', 'NOT_FOUND');
    }
    return successResponse(res, 200, sport, 'Sport details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new sport (Admin / Coordinator)
 * @route POST /api/v1/sports
 * @access Protected (Admin, Coordinator)
 */
const createSport = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;
    if (!name) {
      return errorResponse(res, 400, 'Sport name is required', 'MISSING_NAME');
    }

    const existing = await Sport.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return errorResponse(res, 400, 'Sport with this name already exists', 'DUPLICATE_SPORT');
    }

    const sport = await Sport.create({
      name: name.trim(),
      category: category || 'Team',
      description: description || '',
      icon: icon || 'trophy',
      isActive: true,
      createdBy: req.user._id,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_SPORT',
      module: 'Sports Management',
      description: `Created new sport: ${sport.name} (${sport.category})`,
      relatedRecordId: sport._id,
      req,
    });

    return successResponse(res, 201, sport, 'Sport created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update sport details
 * @route PUT /api/v1/sports/:id
 * @access Protected (Admin, Coordinator)
 */
const updateSport = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return errorResponse(res, 404, 'Sport not found', 'NOT_FOUND');
    }

    if (name && name.trim().toLowerCase() !== sport.name.toLowerCase()) {
      const existing = await Sport.findOne({ name: new RegExp(`^${name.trim()}$`, 'i'), _id: { $ne: sport._id } });
      if (existing) {
        return errorResponse(res, 400, 'Sport with this name already exists', 'DUPLICATE_SPORT');
      }
      sport.name = name.trim();
    }

    if (category) sport.category = category;
    if (description !== undefined) sport.description = description;
    if (icon) sport.icon = icon;

    await sport.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_SPORT',
      module: 'Sports Management',
      description: `Updated sport details for ${sport.name}`,
      relatedRecordId: sport._id,
      req,
    });

    return successResponse(res, 200, sport, 'Sport updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle sport active/inactive status
 * @route PATCH /api/v1/sports/:id/status
 * @access Protected (Admin, Coordinator)
 */
const toggleSportStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 400, 'isActive boolean property is required', 'INVALID_STATUS');
    }

    const sport = await Sport.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!sport) {
      return errorResponse(res, 404, 'Sport not found', 'NOT_FOUND');
    }

    await logAudit({
      user: req.user,
      action: isActive ? 'ACTIVATE_SPORT' : 'DEACTIVATE_SPORT',
      module: 'Sports Management',
      description: `${isActive ? 'Activated' : 'Deactivated'} sport ${sport.name}`,
      relatedRecordId: sport._id,
      req,
    });

    return successResponse(res, 200, sport, `Sport ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete sport
 * @route DELETE /api/v1/sports/:id
 * @access Protected (Admin, Coordinator)
 */
const deleteSport = async (req, res, next) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) {
      return errorResponse(res, 404, 'Sport not found', 'NOT_FOUND');
    }

    await logAudit({
      user: req.user,
      action: 'DELETE_SPORT',
      module: 'Sports Management',
      description: `Deleted sport ${sport.name}`,
      relatedRecordId: req.params.id,
      req,
    });

    return successResponse(res, 200, null, 'Sport deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSports,
  getSportById,
  createSport,
  updateSport,
  toggleSportStatus,
  deleteSport,
};
