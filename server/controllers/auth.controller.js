import * as authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import {
  setAuthCookies,
  setAccessTokenCookie,
  clearAuthCookies,
  getRefreshTokenFromReq,
} from '../config/cookie.config.js';

// register new user
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 201,
  });
});

// login user
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  setAuthCookies(res, result.data);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// verify email otp
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await authService.verifyEmail({ email, otp });

  if (result.data) {
    setAuthCookies(res, result.data);
  }

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// resend verification otp
export const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.resendVerificationOtp({ email });

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// refresh access token
export const refreshToken = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromReq(req);

  if (!token) {
    clearAuthCookies(res);
    return sendError(res, {
      message: 'Refresh token missing',
      statusCode: 401,
    });
  }

  try {
    const result = await authService.refreshToken(token);

    setAuthCookies(res, result.data);

    return sendSuccess(res, {
      message: result.message,
      data: result.data,
      statusCode: 200,
    });
  } catch (error) {
    clearAuthCookies(res);
    throw error;
  }
});

// send password reset otp
export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// resend reset password otp
export const resendPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.resendPasswordResetOtp({ email });

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// verify reset password otp
export const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await authService.verifyPasswordResetOtp({ email, otp });

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// change password for logged in user
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id;

  const result = await authService.changePassword(userId, req.body);

  clearAuthCookies(res);

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// reset password using token or otp
export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  clearAuthCookies(res);

  sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

// logout user and clear cookies
export const logout = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromReq(req);

  const result = await authService.logout(token);

  clearAuthCookies(res);

  return sendSuccess(res, {
    message: result.message,
    statusCode: 200,
  });
});

// get current user profile
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user._id;

  const result = await authService.getMe(userId);

  return sendSuccess(res, {
    message: result.message,
    data: result.data,
    statusCode: 200,
  });
});

export default {
  register,
  login,
  verifyEmail,
  resendVerificationOtp,
  refreshToken,
  forgotPassword,
  resendPasswordResetOtp,
  verifyPasswordResetOtp,
  changePassword,
  resetPassword,
  logout,
  getMe,
};
