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
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        logger.success('Connected to MongoDB successfully');

        await mongoose.syncIndexes().catch((err) => {
          logger.warn('Index sync notice:', err.message);
        });

        return mongoose.connection;
      } catch (atlasErr) {
        logger.warn('Could not connect to external MongoDB URI (IP may not be whitelisted in Atlas):', atlasErr.message);
        logger.info('Falling back to local in-memory MongoDB for seamless development...');
      }
    }

    // In-memory fallback
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
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error.message);
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
