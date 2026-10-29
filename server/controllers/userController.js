const User = require('../models/users.model');
const Role = require('../models/roles.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * @desc Get all users (Admin only) with search, filters, pagination
 * @route GET /api/v1/users
 * @access Protected (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by role name
    if (req.query.role) {
      const roleDoc = await Role.findOne({ name: req.query.role.toLowerCase() });
      if (roleDoc) query.role = roleDoc._id;
    }

    // Filter by status (active/inactive)
    if (req.query.status) {
      if (req.query.status === 'active') query.isActive = true;
      if (req.query.status === 'inactive') query.isActive = false;
    }

    // Search by name, email, registerNumber, or department
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { registerNumber: searchRegex },
        { department: searchRegex },
      ];
    }

    const users = await User.find(query).populate('role').skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    return successResponse(res, 200, users, 'Users retrieved successfully', {
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
 * @desc Get user by ID
 * @route GET /api/v1/users/:id
 * @access Protected (Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }
    return successResponse(res, 200, user, 'User details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create staff/student user (Admin only)
 * @route POST /api/v1/users
 * @access Protected (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleName, department, phone, registerNumber, year } = req.body;

    if (!name || !email || !password || !roleName) {
      return errorResponse(res, 400, 'Name, email, password, and role are required', 'MISSING_FIELDS');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 400, 'User with this email already exists', 'DUPLICATE_EMAIL');
    }

    const roleObj = await Role.findOne({ name: roleName.toLowerCase() });
    if (!roleObj) {
      return errorResponse(res, 400, `Role '${roleName}' not found`, 'ROLE_NOT_FOUND');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: roleObj._id,
      department,
      phone,
      registerNumber,
      year,
      isActive: true,
    });

    await logAudit({
      user: req.user,
      action: 'CREATE_USER',
      module: 'User Management',
      description: `Created user ${email} with role ${roleName}`,
      relatedRecordId: user._id,
      req,
    });

    const populated = await User.findById(user._id).populate('role');
    return successResponse(res, 201, populated, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update user details
 * @route PUT /api/v1/users/:id
 * @access Protected (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, department, phone, registerNumber, year } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) {
        return errorResponse(res, 400, 'Email address is already in use', 'DUPLICATE_EMAIL');
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (registerNumber !== undefined) user.registerNumber = registerNumber;
    if (year !== undefined) user.year = year;

    await user.save();

    await logAudit({
      user: req.user,
      action: 'UPDATE_USER',
      module: 'User Management',
      description: `Updated details for user ${user.email}`,
      relatedRecordId: user._id,
      req,
    });

    const updatedUser = await User.findById(user._id).populate('role');
    return successResponse(res, 200, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Change user role
 * @route PATCH /api/v1/users/:id/role
 * @access Protected (Admin)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { roleName } = req.body;
    if (!roleName) {
      return errorResponse(res, 400, 'roleName is required', 'MISSING_ROLE');
    }

    const roleObj = await Role.findOne({ name: roleName.toLowerCase() });
    if (!roleObj) {
      return errorResponse(res, 400, 'Invalid role specified', 'INVALID_ROLE');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role: roleObj._id }, { new: true }).populate('role');
    if (!user) return errorResponse(res, 404, 'User not found', 'NOT_FOUND');

    await logAudit({
      user: req.user,
      action: 'UPDATE_USER_ROLE',
      module: 'User Management',
      description: `Updated role of ${user.email} to ${roleName}`,
      relatedRecordId: user._id,
      req,
    });

    return successResponse(res, 200, user, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Toggle user activation / deactivation status
 * @route PATCH /api/v1/users/:id/status
 * @access Protected (Admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return errorResponse(res, 400, 'isActive status boolean parameter is required', 'INVALID_STATUS');
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id && !isActive) {
      return errorResponse(res, 400, 'You cannot deactivate your own active admin account', 'SELF_DEACTIVATION_DENIED');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).populate('role');
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }

    await logAudit({
      user: req.user,
      action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      module: 'User Management',
      description: `${isActive ? 'Activated' : 'Deactivated'} user ${user.email}`,
      relatedRecordId: user._id,
      req,
    });

    return successResponse(res, 200, user, `User account ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/v1/users/:id
 * @access Protected (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return errorResponse(res, 400, 'You cannot delete your own account', 'SELF_DELETE_DENIED');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }

    await logAudit({
      user: req.user,
      action: 'DELETE_USER',
      module: 'User Management',
      description: `Deleted user ${user.email}`,
      relatedRecordId: req.params.id,
      req,
    });

    return successResponse(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};
