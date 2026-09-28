import { sendError } from '../utils/apiResponse.js';
import { verifyAccessToken } from '../config/jwt.js';
import { ACCESS_TOKEN_COOKIE } from '../config/cookie.config.js';
import User from '../models/User.js';

// verify jwt from auth header or cookie and attach user to request
export const authenticate = async (req, res, next) => {
  let token;

  // check authorization header first
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // fallback to httponly cookie
  else if (req.cookies?.[ACCESS_TOKEN_COOKIE]) {
    token = req.cookies[ACCESS_TOKEN_COOKIE];
  }

  if (!token) {
    return sendError(res, {
      message: 'No token provided',
      statusCode: 401,
    });
  }

  try {
    const decoded = await verifyAccessToken(token);

    if (decoded.type && decoded.type !== 'access') {
      return sendError(res, {
        message: 'Invalid token type',
        statusCode: 401,
      });
    }

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return sendError(res, {
        message: 'User no longer exists',
        statusCode: 401,
      });
    }

    req.user = user;
    req.user.userId = user._id.toString();

    next();
  } catch (error) {
    return sendError(res, {
      message: 'Invalid or expired token',
      statusCode: 401,
    });
  }
};

// check if user role has required permission
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, {
        message: `Role '${req.user?.role || 'guest'}' is not authorized to access this resource`,
        statusCode: 403,
      });
    }
    next();
  };
};

export default {
  authenticate,
  authorize,
};
