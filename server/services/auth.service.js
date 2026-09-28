import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  signResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../config/jwt.js';
import { sendOtpEmail } from '../utils/sendEmail.js';
import AppError from '../utils/AppError.js';
import { generateOtp } from '../utils/generateOtp.js';

// Helper to run transaction if supported by MongoDB (replica set), fallback to direct execution for standalone mongod
const runInTransaction = async (work) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}
    }
    // If error is due to transactions not supported in standalone MongoDB, retry without session
    if (
      error.message &&
      (error.message.includes('replica set') ||
        error.message.includes('standalone') ||
        error.message.includes('Transaction numbers'))
    ) {
      return await work(null);
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// register user
export const register = async (input) => {
  const {
    name,
    firstName,
    lastName,
    email,
    password,
    phone = '',
    role = 'renter',
    location = '',
    profileImage = '',
    avatar = '',
  } = input;

  const normalizedEmail = email.toLowerCase().trim();

  let fName = firstName?.trim();
  let lName = lastName?.trim();
  if (!fName && name) {
    const parts = name.trim().split(' ');
    fName = parts[0];
    lName = parts.slice(1).join(' ') || '';
  }
  const fullName = [fName, lName].filter(Boolean).join(' ') || name || 'User';
  const assignedRole = role === 'owner' ? 'owner' : 'renter';
  const assignedImage = profileImage || avatar || '';

  return await runInTransaction(async (session) => {
    const sessionOpts = session ? { session } : {};

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail }, null, sessionOpts);

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new AppError('Email is already registered. Please log in.', 400);
      }

      // If user exists but is unverified, update details and send fresh OTP
      const hashedPassword = await bcrypt.hash(password, 10);
      const { otp, hashedOtp, expiry } = await generateOtp();

      existingUser.name = fullName;
      existingUser.password = hashedPassword;
      existingUser.phone = phone ? phone.trim() : existingUser.phone;
      existingUser.role = assignedRole;
      existingUser.location = location ? location.trim() : existingUser.location;
      existingUser.profileImage = assignedImage || existingUser.profileImage;
      existingUser.emailVerificationOtp = hashedOtp;
      existingUser.emailVerificationOtpExpiry = expiry;

      await existingUser.save(sessionOpts);

      await sendOtpEmail({
        email: existingUser.email,
        name: fName || existingUser.name,
        otp,
        purpose: 'email_verification',
      });

      return {
        message: 'Account details updated. A new OTP has been sent to your email.',
        data: {
          userId: existingUser._id,
          email: existingUser.email,
          requiresVerification: true,
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { otp, hashedOtp, expiry } = await generateOtp();

    const [user] = await User.create(
      [
        {
          name: fullName,
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone?.trim() || '',
          role: assignedRole,
          location: location?.trim() || '',
          profileImage: assignedImage,
          isEmailVerified: false,
          emailVerificationOtp: hashedOtp,
          emailVerificationOtpExpiry: expiry,
        },
      ],
      sessionOpts
    );

    // Send OTP email BEFORE committing transaction
    await sendOtpEmail({
      email: user.email,
      name: fName || user.name,
      otp,
      purpose: 'email_verification',
    });

    return {
      message: 'Account created successfully. OTP sent to your email.',
      data: {
        userId: user._id,
        email: user.email,
        requiresVerification: true,
      },
    };
  });
};

// login user
export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // find user
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password +refreshToken'
  );

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check email verification
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email', 403, {
      requiresVerification: true,
      email: user.email,
    });
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();

  // Generate access token
  const accessToken = await signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  // Generate refresh token (used to generate new access token)
  const refreshToken = await signRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  // Store hashed refresh token for secure session validation
  user.refreshToken = await bcrypt.hash(refreshToken, 10);

  await user.save({ validateBeforeSave: false });

  const userData = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
  };

  return {
    message: user.mustChangePassword
      ? 'Password change required'
      : 'Login successful',
    data: {
      accessToken,
      refreshToken,
      token: accessToken,
      mustChangePassword: user.mustChangePassword,
      user: userData,
      ...userData,
    },
  };
};

// verify email
export const verifyEmail = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+emailVerificationOtp +emailVerificationOtpExpiry +refreshToken');

  if (!user || !user.emailVerificationOtp || !user.emailVerificationOtpExpiry) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Reject expired OTP
  if (user.emailVerificationOtpExpiry < new Date()) {
    throw new AppError('OTP expired', 400);
  }

  let isMatch = false;
  if (user.emailVerificationOtp.startsWith('$2')) {
    isMatch = await bcrypt.compare(otp.toString().trim(), user.emailVerificationOtp);
  } else {
    isMatch = user.emailVerificationOtp === otp.toString().trim();
  }

  if (!isMatch) {
    throw new AppError('Invalid OTP', 400);
  }

  // Email successfully verified
  user.isEmailVerified = true;

  // Clear OTP after successful verification
  user.emailVerificationOtp = null;
  user.emailVerificationOtpExpiry = null;
  user.lastLoginAt = new Date();

  // Issue session tokens upon verification
  const accessToken = await signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const refreshToken = await signRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  const userData = {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    profileImage: user.profileImage,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
  };

  return {
    message: 'Email verified successfully',
    data: {
      accessToken,
      refreshToken,
      token: accessToken,
      user: userData,
      ...userData,
    },
  };
};

// resend verification otp
export const resendVerificationOtp = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // find user
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // already verified
  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // generate otp
  const { otp, hashedOtp, expiry } = await generateOtp();

  // save otp
  user.emailVerificationOtp = hashedOtp;
  user.emailVerificationOtpExpiry = expiry;

  await user.save({ validateBeforeSave: false });

  // send otp
  await sendOtpEmail({
    email: user.email,
    name: user.name || 'User',
    otp,
    purpose: 'email_verification',
  });

  return {
    message: 'Verification OTP sent successfully',
    data: null,
  };
};

// refresh token
export const refreshToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  let decoded;
  try {
    decoded = await verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AppError('Invalid or expired session. Please login again', 401);
  }

  if (decoded.type && decoded.type !== 'refresh') {
    throw new AppError('Invalid refresh token', 401);
  }

  const userId = decoded.userId || decoded.id;
  const user = await User.findById(userId).select('+refreshToken');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.refreshToken) {
    throw new AppError('Session expired. Please login again', 401);
  }

  let isRefreshTokenValid = false;
  if (user.refreshToken.startsWith('$2')) {
    isRefreshTokenValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
  } else {
    isRefreshTokenValid = user.refreshToken === incomingRefreshToken;
  }

  if (!isRefreshTokenValid) {
    throw new AppError('Invalid or expired session. Please login again', 401);
  }

  const accessToken = await signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const newRefreshToken = await signRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Access token refreshed successfully',
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken,
    },
  };
};

// forgot password
export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Email is not verified', 400);
  }

  // Generate random 6 digit OTP
  const { otp, hashedOtp, expiry } = await generateOtp();

  user.passwordResetOtp = hashedOtp;
  user.passwordResetOtpExpiry = expiry;

  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({
    email: user.email,
    name: user.name || 'User',
    otp,
    purpose: 'password_reset',
  });

  return {
    message: 'Password reset OTP sent successfully',
    data: null,
  };
};

// resend reset password otp
export const resendPasswordResetOtp = async ({ email }) => {
  return forgotPassword({ email });
};

// verify otp
export const verifyPasswordResetOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+passwordResetOtp +passwordResetOtpExpiry'
  );

  if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiry) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Reject expired OTP
  if (user.passwordResetOtpExpiry < new Date()) {
    throw new AppError('OTP expired', 400);
  }

  let isMatch = false;
  if (user.passwordResetOtp.startsWith('$2')) {
    isMatch = await bcrypt.compare(otp.toString().trim(), user.passwordResetOtp);
  } else {
    isMatch = user.passwordResetOtp === otp.toString().trim();
  }

  if (!isMatch) {
    throw new AppError('Invalid OTP', 400);
  }

  // invalidate OTP
  user.passwordResetOtp = null;
  user.passwordResetOtpExpiry = null;

  await user.save({ validateBeforeSave: false });

  const resetToken = await signResetToken({ userId: user._id.toString() });

  return {
    message: 'OTP verified successfully',
    data: { resetToken, email: user.email },
  };
};

// change password
export const changePassword = async (userId, payload) => {
  const { currentPassword, newPassword, confirmPassword } = payload;

  // Instant validation checks before hitting DB or CPU-heavy bcrypt
  if (newPassword !== confirmPassword) {
    throw new AppError('Confirm password must match new password', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      'New password must be different from the current password',
      400
    );
  }

  // Load user with password and refreshToken
  const user = await User.findById(userId).select('+password +refreshToken');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password and commit changes
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date();
  user.mustChangePassword = false;
  user.refreshToken = null; // Invalidate all active sessions

  await user.save();

  return {
    message: 'Password changed successfully',
    data: null,
  };
};

// reset password
export const resetPassword = async (payload) => {
  const { resetToken, email, otp, password, newPassword } = payload;
  const targetPassword = password || newPassword;

  if (!targetPassword) {
    throw new AppError('Password is required', 400);
  }

  let user;

  // Option A: resetToken is provided
  if (resetToken) {
    let decoded;
    try {
      decoded = await verifyResetToken(resetToken);
      if (decoded.type && decoded.type !== 'reset') {
        throw new AppError('Invalid or expired reset token', 400);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired reset token', 400);
    }

    const userId = decoded.userId || decoded.id;
    user = await User.findById(userId).select('+password +refreshToken');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent token replay attacks: reject if password was already changed after this reset token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const tokenIssuedAtMs = decoded.iat * 1000;
      if (user.passwordChangedAt.getTime() >= tokenIssuedAtMs) {
        throw new AppError(
          'This reset token has already been used or is expired',
          400
        );
      }
    }
  }
  // Option B: direct email + otp
  else if (email && otp) {
    const normalizedEmail = email.toLowerCase().trim();
    user = await User.findOne({ email: normalizedEmail }).select(
      '+password +passwordResetOtp +passwordResetOtpExpiry +refreshToken'
    );

    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpiry) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    if (user.passwordResetOtpExpiry < new Date()) {
      throw new AppError('OTP expired', 400);
    }

    let isMatch = false;
    if (user.passwordResetOtp.startsWith('$2')) {
      isMatch = await bcrypt.compare(otp.toString().trim(), user.passwordResetOtp);
    } else {
      isMatch = user.passwordResetOtp === otp.toString().trim();
    }

    if (!isMatch) {
      throw new AppError('Invalid OTP', 400);
    }

    user.passwordResetOtp = null;
    user.passwordResetOtpExpiry = null;
  } else {
    throw new AppError('Please provide reset token or email with OTP', 400);
  }

  const hashedPassword = await bcrypt.hash(targetPassword, 10);

  user.password = hashedPassword;
  user.passwordChangedAt = new Date();
  user.mustChangePassword = false;

  // logout all sessions
  user.refreshToken = null;

  // Cleanup old reset OTP
  user.passwordResetOtp = null;
  user.passwordResetOtpExpiry = null;

  await user.save();

  return {
    message: 'Password reset successfully',
    data: null,
  };
};

// logout
export const logout = async (refreshToken) => {
  if (refreshToken) {
    try {
      const decoded = await verifyRefreshToken(refreshToken);
      const userId = decoded.userId || decoded.id;
      if (userId) {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
      }
      return { message: 'Logged out successfully' };
    } catch {
      // Token is invalid or expired — proceed cleanly
    }
  }

  return {
    message: 'Logged out successfully',
  };
};

// get logged in user profile
export const getMe = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return {
    message: 'Profile fetched successfully',
    data: { user },
  };
};

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
