const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, token missing', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sportsync_super_secret_jwt_key_2026_change_in_production');
    const user = await User.findById(decoded.id).populate('role');

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'User account deactivated or not found', 'UNAUTHORIZED');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, token verification failed', 'INVALID_TOKEN');
  }
};

module.exports = { protect };
