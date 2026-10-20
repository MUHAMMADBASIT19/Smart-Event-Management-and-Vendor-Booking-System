import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Vendor = sequelize.define(
  'Vendor',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CNIC: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
    },
    address: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('accepted', 'rejected', 'pending'),
      defaultValue: 'pending',
    },
    businessName: {
      type: DataTypes.STRING,
      unique: true,
    },
    bankName: {
      type: DataTypes.STRING,
    },
    accountNumber: {
      type: DataTypes.STRING,
    },
    routingNumber: {
      type: DataTypes.STRING,
    },
    documentPath: {
      type: DataTypes.STRING,
    },
    isVendor: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    event_id: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: 'vendors',
  }
);

export default Vendor;
