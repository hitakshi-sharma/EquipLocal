import Joi from 'joi';

// Reusable strong password validation schema
export const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[a-zA-Z])(?=.*\d)\S+$/)
  .messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password must be at least {#limit} characters long',
    'string.max': 'Password cannot exceed {#limit} characters',
    'string.pattern.base': 'Password must contain at least one letter and one number (no spaces)',
    'any.required': 'Password is required',
  });

// Reusable email validation schema
const emailSchema = Joi.string().email().required().lowercase().trim().messages({
  'string.email': 'Please provide a valid email address',
  'string.empty': 'Email cannot be empty',
  'any.required': 'Email is required',
});

// Reusable 6-digit OTP validation schema
const otpSchema = Joi.string().pattern(/^\d{6}$/).required().messages({
  'string.pattern.base': 'OTP must be a 6-digit number',
  'string.empty': 'OTP cannot be empty',
  'any.required': 'OTP is required',
});

// Register input validation schema
export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  firstName: Joi.string().min(2).max(50).trim(),
  lastName: Joi.string().allow('', null).max(50).trim(),
  email: emailSchema,
  password: passwordSchema.required(),
  phone: Joi.string().min(7).max(20).required().trim().messages({
    'string.empty': 'Phone number cannot be empty',
    'any.required': 'Phone number is required',
  }),
  role: Joi.string().valid('renter', 'owner').default('renter'),
  location: Joi.string().min(2).max(100).required().trim().messages({
    'string.empty': 'Location cannot be empty',
    'any.required': 'Location is required',
  }),
  profileImage: Joi.string().allow('', null).default(''),
}).or('name', 'firstName').messages({
  'object.missing': 'Please provide name or first name',
});

// Login input validation schema
export const loginValidation = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

// Verify email OTP validation schema
export const verifyEmailValidation = Joi.object({
  email: emailSchema,
  otp: otpSchema,
});

// Resend verification OTP validation schema
export const resendVerificationOtpValidation = Joi.object({
  email: emailSchema,
});

// Refresh token validation schema
export const refreshTokenValidation = Joi.object({
  refreshToken: Joi.string().allow('', null),
});

// Forgot password validation schema
export const forgotPasswordValidation = Joi.object({
  email: emailSchema,
});

// Resend password reset OTP validation schema
export const resendPasswordResetOtpValidation = Joi.object({
  email: emailSchema,
});

// Verify password reset OTP validation schema
export const verifyPasswordResetOtpValidation = Joi.object({
  email: emailSchema,
  otp: otpSchema,
});

// Change password validation schema (Authenticated)
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Current password cannot be empty',
    'any.required': 'Current password is required',
  }),
  newPassword: passwordSchema
    .required()
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'New password must be different from current password',
      'any.required': 'New password is required',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match new password',
    'string.empty': 'Confirm password cannot be empty',
    'any.required': 'Confirm password is required',
  }),
});

// Reset password validation schema
export const resetPasswordValidation = Joi.object({
  resetToken: Joi.string().allow('', null),
  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Please provide a valid email address',
  }),
  otp: Joi.string().pattern(/^\d{6}$/).messages({
    'string.pattern.base': 'OTP must be a 6-digit number',
  }),
  password: passwordSchema,
  newPassword: passwordSchema,
})
  .or('password', 'newPassword')
  .messages({
    'object.missing': 'Please provide a new password',
  });

export default {
  passwordSchema,
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
};
