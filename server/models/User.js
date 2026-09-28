import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide password'],
      select: false,
    },

    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },

    role: {
      type: String,
      enum: ['renter', 'owner'],
      default: 'renter',
    },

    location: {
      type: String,
      required: [true, 'Please provide city/location'],
      trim: true,
    },

    profileImage: {
      type: String,
      default: '',
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOtp: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationOtpExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },

    passwordResetOtp: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetOtpExpiry: {
      type: Date,
      default: null,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// indexes
userSchema.index({ role: 1 });
userSchema.index({ location: 1 });

export const User = mongoose.model('User', userSchema);
export default User;
