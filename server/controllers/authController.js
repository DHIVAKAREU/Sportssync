const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const Role = require('../models/roles.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Generate JWT helper
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sportsync_super_secret_jwt_key_2026_change_in_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Seed roles if not present
const seedRolesIfEmpty = async () => {
  const count = await Role.countDocuments();
  if (count === 0) {
    console.log('Seeding system roles...');
    await Role.insertMany([
      { name: 'admin', description: 'Full system administrator' },
      { name: 'coordinator', description: 'Sports council coordinator' },
      { name: 'coach', description: 'Sport coach' },
      { name: 'equipment_incharge', description: 'Equipment & store incharge' },
      { name: 'student', description: 'Student player / member' },
    ]);
  }
};

/**
 * @desc Student Self-Registration
 * @route POST /api/v1/auth/register
 * @access Public (Student role only)
 */
const register = async (req, res, next) => {
  try {
    await seedRolesIfEmpty();
    const { name, email, password, registerNumber, department, year } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email already exists', 'DUPLICATE_EMAIL');
    }

    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      return errorResponse(res, 500, 'Student role not found in system', 'ROLE_NOT_FOUND');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: studentRole._id,
      registerNumber,
      department,
      year,
    });

    const token = signToken(user._id);
    const populatedUser = await User.findById(user._id).populate('role');

    return successResponse(res, 201, { token, user: populatedUser }, 'Student account registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Login user & return JWT token (Support seed demo users if empty DB)
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    await seedRolesIfEmpty();
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password', 'MISSING_CREDENTIALS');
    }

    // Auto-seed demo accounts if User table is empty (for fast testing / evaluation)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial demo accounts...');
      const rolesMap = {};
      const allRoles = await Role.find();
      allRoles.forEach(r => { rolesMap[r.name] = r._id; });

      await User.create([
        { name: 'System Admin', email: 'admin@sportsync.edu', password: 'Admin@123', role: rolesMap['admin'] },
        { name: 'Sports Coordinator', email: 'coordinator@sportsync.edu', password: 'Coord@123', role: rolesMap['coordinator'] },
        { name: 'Coach David', email: 'coach@sportsync.edu', password: 'Coach@123', role: rolesMap['coach'], department: 'Physical Education' },
        { name: 'Equipment Manager', email: 'equipment@sportsync.edu', password: 'Equip@123', role: rolesMap['equipment_incharge'] },
        { name: 'Alex Johnson', email: 'student@sportsync.edu', password: 'Student@123', role: rolesMap['student'], registerNumber: 'REG1001', department: 'Computer Science', year: 3 },
      ]);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('role');

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return errorResponse(res, 401, 'Account has been deactivated', 'ACCOUNT_DISABLED');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, 200, { token, user: userObj }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently logged in user profile
 * @route GET /api/v1/auth/me
 * @access Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    return successResponse(res, 200, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
