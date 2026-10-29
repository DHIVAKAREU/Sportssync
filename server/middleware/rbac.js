const { errorResponse } = require('../utils/apiResponse');

const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 401, 'User role not resolved', 'UNAUTHORIZED');
    }

    const userRoleName = req.user.role.name ? req.user.role.name.toLowerCase() : '';
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(userRoleName) && userRoleName !== 'admin') {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${userRoleName}' does not have sufficient permissions for this action.`,
        'FORBIDDEN'
      );
    }

    next();
  };
};

module.exports = { checkRole };
