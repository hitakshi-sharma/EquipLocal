// standard success response helper
export const sendSuccess = (
  res,
  { message = 'Success', data = null, statusCode = 200 } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// standard error response helper
export const sendError = (
  res,
  { message = 'Error', statusCode = 500, errors = [], requiresVerification = false, email = null } = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    requiresVerification,
    email,
    errors,
  });
};

export default {
  sendSuccess,
  sendError,
};
