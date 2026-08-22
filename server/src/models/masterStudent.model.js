const mongoose = require('mongoose');

const masterStudentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science and Engineering'
    },
    course: {
      type: String,
      required: true,
      default: 'B.Tech'
    },
    year: {
      type: Number,
      required: true,
      default: 2
    },
    status: {
      type: String,
      enum: ['active', 'graduated', 'withdrawn'],
      default: 'active'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

const MasterStudent = mongoose.model('MasterStudent', masterStudentSchema);

module.exports = MasterStudent;
