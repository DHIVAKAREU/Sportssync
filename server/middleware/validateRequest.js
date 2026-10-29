const { errorResponse } = require('../utils/apiResponse');

const validateRequest = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      return errorResponse(res, 400, errorMessage, 'INVALID_INPUT');
    }
    next();
  };
};

module.exports = validateRequest;
