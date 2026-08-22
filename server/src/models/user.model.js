const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Exclude from queries by default for security
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    collegeDetails: {
      course: { type: String, default: 'B.Tech' },
      department: { type: String, default: 'Computer Science and Engineering' },
      year: { type: Number, default: 2 },
      status: { type: String, default: 'active' }
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active'
    },
    lastLoginAt: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
