const Announcement = require('../models/announcements.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Seed announcement if empty
const seedAnnouncementsIfEmpty = async (userId) => {
  const count = await Announcement.countDocuments();
  if (count === 0) {
    console.log('Seeding initial announcements...');
    await Announcement.create([
      {
        title: 'Annual Sports Day Registration Open',
        description: 'Registrations are now open for all track and field events for the upcoming Annual Sports Meet. Please register before Aug 28.',
        targetAudience: ['All'],
        createdBy: userId,
      },
      {
        title: 'Basketball Court Maintenance Schedule',
        description: 'Indoor Court A will undergo resurfacing from Aug 20 to Aug 22. Practice sessions have been relocated to Court B.',
        targetAudience: ['All'],
        createdBy: userId,
      },
    ]);
  }
};

/**
 * @desc Get announcements
 * @route GET /api/v1/announcements
 * @access Protected
 */
const getAnnouncements = async (req, res, next) => {
  try {
    if (req.user) {
      await seedAnnouncementsIfEmpty(req.user._id);
    }
    const userRole = req.user.role.name.toLowerCase();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ targetAudience: 'All' }, { targetAudience: userRole }],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, announcements, 'Announcements retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create announcement
 * @route POST /api/v1/announcements
 * @access Protected (Admin, Coordinator)
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, targetAudience, attachment } = req.body;

    const announcement = await Announcement.create({
      title,
      description,
      targetAudience: targetAudience || ['All'],
      attachment,
      createdBy: req.user._id,
    });

    return successResponse(res, 201, announcement, 'Announcement posted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
};
