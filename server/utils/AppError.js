// custom error class for operational http errors
export class AppError extends Error {
  constructor(message, statusCode = 500, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = extra.errors || [];
    this.requiresVerification = extra.requiresVerification || false;
    this.email = extra.email || null;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
