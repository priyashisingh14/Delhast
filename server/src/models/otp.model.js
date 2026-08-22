const mongoose = require('mongoose');
const OTP_PURPOSES = require('../constants/otpPurposes');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSES),
      required: true,
      index: true
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: Mongo automatically removes expired OTPs
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying active OTP by email and purpose
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
