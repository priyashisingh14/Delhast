const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database
 * Uses MongoDB URI if provided, otherwise boots an in-memory MongoDB instance for zero-friction dev/testing.
 */
const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      try {
        logger.info('Attempting connection to configured MongoDB URI...');
        mongoose.set('strictQuery', true);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        logger.success('Connected to MongoDB successfully');

        await mongoose.syncIndexes().catch((err) => {
          logger.warn('Index sync notice:', err.message);
        });

        return mongoose.connection;
      } catch (atlasErr) {
        logger.error('Could not connect to external MongoDB URI:', atlasErr.message);
        if (env.NODE_ENV === 'production') {
          throw new Error(
            `MongoDB connection failed in production: ${atlasErr.message}. ` +
            'Please verify MONGODB_URI on Render and ensure MongoDB Atlas Network Access allows 0.0.0.0/0.'
          );
        }
        logger.info('Falling back to local in-memory MongoDB for development...');
      }
    }

    // In-memory fallback for local development only
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
      logger.success(`In-memory MongoDB initialized at: ${uri}`);

      mongoose.set('strictQuery', true);
      await mongoose.connect(uri);
      logger.success('Connected to in-memory MongoDB successfully');

      await mongoose.syncIndexes().catch((err) => {
        logger.warn('Index sync notice:', err.message);
      });

      return mongoose.connection;
    } catch (memErr) {
      logger.error('In-memory MongoDB fallback failed:', memErr.message);
      throw new Error('No valid MongoDB connection available. Please configure MONGODB_URI in environment variables.');
    }
  } catch (error) {
    logger.error('Fatal Database Connection Error:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB and shut down in-memory server if applicable
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error during MongoDB disconnection:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
