/**
 * Standardized success response envelope
 */
const successResponse = (res, statusCode = 200, data = {}, message = '', pagination = null) => {
  const payload = {
    success: true,
    message: message || undefined,
    data,
  };
  if (pagination) {
    payload.pagination = pagination;
  }
  return res.status(statusCode).json(payload);
};

/**
 * Standardized error response envelope
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', error = 'SERVER_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
