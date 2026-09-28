import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  resendVerificationOtpValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resendPasswordResetOtpValidation,
  verifyPasswordResetOtpValidation,
  changePasswordValidation,
  resetPasswordValidation,
} from '../validations/auth.validation.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Register new user
router.post('/register', validate(registerValidation), authController.register);

// Login user
router.post('/login', validate(loginValidation), authController.login);

// Verify email OTP
router.post('/verify-email', validate(verifyEmailValidation), authController.verifyEmail);

// Resend verification OTP
router.post(
  '/resend-verification-otp',
  validate(resendVerificationOtpValidation),
  authController.resendVerificationOtp
);

// Refresh access token
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken);

// Request password reset OTP
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword);

// Resend password reset OTP
router.post(
  '/resend-reset-password-otp',
  validate(resendPasswordResetOtpValidation),
  authController.resendPasswordResetOtp
);

// Verify password reset OTP
router.post(
  '/verify-reset-password-otp',
  validate(verifyPasswordResetOtpValidation),
  authController.verifyPasswordResetOtp
);

// Change password (authenticated)
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidation),
  authController.changePassword
);

// Reset password
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);

// Logout user
router.post('/logout', authController.logout);

// Get current user profile
router.get('/me', authenticate, authController.getMe);

export default router;
