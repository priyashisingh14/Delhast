const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { seedMasterStudents } = require('./seeds/masterStudents.seed');
const { initSocket } = require('./socket');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    logger.info(`Starting College Portal Server in [${env.NODE_ENV}] mode...`);

    // 1. Connect to Database
    await connectDB();

    // 2. Seed Master Student records if empty
    await seedMasterStudents();

    // 3. Create HTTP Server & initialize Socket.IO
    const httpServer = http.createServer(app);
    initSocket(httpServer, env.CLIENT_URL);

    // 4. Start listening
    const server = httpServer.listen(env.PORT, () => {
      logger.success(`🚀 Server running smoothly on port ${env.PORT}`);
      logger.info(`📡 API endpoint: http://localhost:${env.PORT}/api/auth & /api/bookings`);
      logger.info(`📧 Active Email Provider: ${env.EMAIL_PROVIDER.toUpperCase()}`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('HTTP server and Database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
  } catch (error) {
    logger.error('Fatal Server Initialization Error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
