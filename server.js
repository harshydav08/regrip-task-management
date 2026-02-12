require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

// Test database connection and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync models - Auto-create tables
    // In production: Set FORCE_DB_SYNC=true for first deployment, then remove it
    if (process.env.NODE_ENV === 'development' || process.env.FORCE_DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized.');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
