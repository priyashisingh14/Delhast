const mongoose = require('mongoose');
const MasterStudent = require('../models/masterStudent.model');
const logger = require('../utils/logger');
const { connectDB, disconnectDB } = require('../config/db');

const initialMasterStudents = [
  {
    registrationNumber: '23CSE101',
    name: 'Priyashi Singh',
    department: 'Computer Science and Engineering',
    course: 'B.Tech',
    year: 2,
    status: 'active',
    email: 'priyashi.singh@gmail.com'
  },
  {
    registrationNumber: '23CSE102',
    name: 'Rahul Kumar',
    department: 'Computer Science and Engineering',
    course: 'B.Tech',
    year: 2,
    status: 'active',
    email: 'rahul.kumar@gmail.com'
  },
  {
    registrationNumber: '22ECE045',
    name: 'Ananya Sharma',
    department: 'Electronics and Communication Engineering',
    course: 'B.Tech',
    year: 3,
    status: 'active',
    email: 'ananya.sharma@gmail.com'
  },
  {
    registrationNumber: '24IT088',
    name: 'Rohan Verma',
    department: 'Information Technology',
    course: 'B.Tech',
    year: 1,
    status: 'active',
    email: 'rohan.verma@gmail.com'
  },
  {
    registrationNumber: '23MECH014',
    name: 'Sneha Patel',
    department: 'Mechanical Engineering',
    course: 'B.Tech',
    year: 2,
    status: 'active',
    email: 'sneha.patel@gmail.com'
  },
  {
    registrationNumber: '23CSE103',
    name: 'Aditya Gupta',
    department: 'Computer Science and Engineering',
    course: 'B.Tech',
    year: 2,
    status: 'active',
    email: 'aditya.gupta@gmail.com'
  }
];

const seedMasterStudents = async () => {
  try {
    const existingCount = await MasterStudent.countDocuments();
    if (existingCount > 0) {
      logger.info(`Master student database already contains ${existingCount} records.`);
      return;
    }

    logger.info('Seeding Master College Student Database...');
    await MasterStudent.insertMany(initialMasterStudents);
    logger.success(`Seeded ${initialMasterStudents.length} master student records.`);
  } catch (error) {
    logger.error('Failed to seed Master Student Database:', error.message);
  }
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedMasterStudents();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = {
  initialMasterStudents,
  seedMasterStudents
};
