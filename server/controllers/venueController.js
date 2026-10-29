const Venue = require('../models/venues.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

// Seed venues if empty
const seedVenuesIfEmpty = async () => {
  const count = await Venue.countDocuments();
  if (count === 0) {
    console.log('Seeding sports venues...');
    await Venue.insertMany([
      { name: 'Indoor Basketball Court A', type: 'Court', capacity: 300, location: 'Sports Complex Fl 1', maintenanceStatus: 'Available' },
      { name: 'Main Football Field', type: 'Outdoor Field', capacity: 1500, location: 'North Campus', maintenanceStatus: 'Available' },
      { name: 'Badminton Hall B', type: 'Indoor Hall', capacity: 150, location: 'Sports Complex Fl 2', maintenanceStatus: 'Available' },
      { name: 'Synthetic Athletics Track', type: 'Track', capacity: 800, location: 'Main Stadium', maintenanceStatus: 'Available' },
    ]);
  }
};

/**
 * @desc Get all venues
 * @route GET /api/v1/venues
 * @access Protected
 */
const getVenues = async (req, res, next) => {
  try {
    await seedVenuesIfEmpty();

    const query = { isActive: true };
    if (req.query.status) {
      query.maintenanceStatus = req.query.status;
    }
    if (req.query.search) {
      query.name = new RegExp(req.query.search, 'i');
    }

    const venues = await Venue.find(query).sort({ name: 1 });
    return successResponse(res, 200, venues, 'Venues retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single venue by ID
 * @route GET /api/v1/venues/:id
 * @access Protected
 */
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return errorResponse(res, 404, 'Venue not found', 'NOT_FOUND');
    return successResponse(res, 200, venue, 'Venue details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create venue
 * @route POST /api/v1/venues
 * @access Protected (Admin, Coordinator)
 */
const createVenue = async (req, res, next) => {
  try {
    const { name, type, capacity, location, maintenanceStatus } = req.body;
    if (!name || !type) {
      return errorResponse(res, 400, 'Venue name and type are required', 'MISSING_FIELDS');
    }

    const existing = await Venue.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return errorResponse(res, 400, 'Venue with this name already exists', 'DUPLICATE_VENUE');
    }

    const venue = await Venue.create({
      name: name.trim(),
      type,
      capacity: capacity || 100,
      location: location || '',
      maintenanceStatus: maintenanceStatus || 'Available',
      isActive: true,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_VENUE',
      module: 'Venues Management',
      description: `Created venue ${venue.name} (${venue.type})`,
      relatedRecordId: venue._id,
      req,
    });

    return successResponse(res, 201, venue, 'Venue created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update venue details or maintenance status
 * @route PUT /api/v1/venues/:id or PATCH /api/v1/venues/:id
 * @access Protected (Admin, Coordinator)
 */
const updateVenue = async (req, res, next) => {
  try {
    const { name, type, capacity, location, maintenanceStatus, isActive } = req.body;
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return errorResponse(res, 404, 'Venue not found', 'NOT_FOUND');
    }

    if (name) venue.name = name.trim();
    if (type) venue.type = type;
    if (capacity !== undefined) venue.capacity = capacity;
    if (location !== undefined) venue.location = location;
    if (maintenanceStatus) venue.maintenanceStatus = maintenanceStatus;
    if (isActive !== undefined) venue.isActive = isActive;

    await venue.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_VENUE',
      module: 'Venues Management',
      description: `Updated venue ${venue.name}`,
      relatedRecordId: venue._id,
      req,
    });

    return successResponse(res, 200, venue, 'Venue updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete venue
 * @route DELETE /api/v1/venues/:id
 * @access Protected (Admin, Coordinator)
 */
const deleteVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return errorResponse(res, 404, 'Venue not found', 'NOT_FOUND');

    venue.isActive = false;
    await venue.save();

    await logAudit({
      user: req.user,
      action: 'DELETE_VENUE',
      module: 'Venues Management',
      description: `Deleted venue ${venue.name}`,
      relatedRecordId: venue._id,
      req,
    });

    return successResponse(res, 200, null, 'Venue deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};
