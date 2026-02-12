const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Action performed: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.'
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of entity: TASK, USER, AUTH, etc.'
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the affected entity'
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Previous state of the entity'
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'New state of the entity'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IPv4 or IPv6 address'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['entity_type', 'entity_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return ActivityLog;
};
