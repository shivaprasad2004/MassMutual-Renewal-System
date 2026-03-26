const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Renewal = sequelize.define('Renewal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  renewal_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Skipped'),
    defaultValue: 'Pending',
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  stage: {
    type: DataTypes.ENUM('upcoming', 'in_progress', 'completed', 'lapsed'),
    defaultValue: 'upcoming',
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Renewal;
