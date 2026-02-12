const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
// Support both DATABASE_URL and individual connection params
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      logging: env === 'development' ? console.log : false,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions,
      define: dbConfig.define
    })
  : new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions,
        define: dbConfig.define,
        retry: dbConfig.retry
      }
    );

// Import models
const User = require('./User')(sequelize);
const Otp = require('./Otp')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);
const Task = require('./Task')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);

// Define associations
User.hasMany(Otp, { foreignKey: 'user_id', as: 'otps' });
Otp.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Otp,
  RefreshToken,
  Task,
  ActivityLog
};
