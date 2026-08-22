const mongoose = require('mongoose');

const signupSessionSchema = new mongoose.Schema(
  {
    signupToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    emailVerified: {
      type: Boolean,
      default: true
    },
    phone: {
      type: String,
      trim: true
    },
    fullName: {
      type: String,
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    idCardVerified: {
      type: Boolean,
      default: false
    },
    ocrExtracted: {
      name: { type: String },
      registrationNumber: { type: String },
      confidence: { type: Number, default: 0 }
    },
    studentDetailsVerified: {
      type: Boolean,
      default: false
    },
    collegeDetails: {
      course: { type: String },
      department: { type: String },
      year: { type: Number },
      status: { type: String }
    },
    step: {
      type: Number,
      default: 1 // 1: Email verified, 2: Student Details, 3: ID verified, 4: Ready for password
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 mins lifetime
      index: { expires: 0 } // TTL index: auto clean-up of abandoned signups
    }
  },
  {
    timestamps: true
  }
);

const SignupSession = mongoose.model('SignupSession', signupSessionSchema);

module.exports = SignupSession;
