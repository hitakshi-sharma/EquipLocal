// 404 not found handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// global error handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // bad object id
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with specified ID';
  }

  // duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered (such as email already in use)';
  }

  // mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    requiresVerification: err.requiresVerification || false,
    email: err.email || undefined,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export default { notFound, errorHandler };
