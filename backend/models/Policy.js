const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  policy_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  premium_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  coverage_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  renewal_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  payment_frequency: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'annually'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Pending Renewal', 'Lapsed', 'Renewed'),
    defaultValue: 'Active',
  },
});

module.exports = Policy;
