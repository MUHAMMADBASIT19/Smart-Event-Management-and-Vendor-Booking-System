import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    vendorId: {
      type: DataTypes.STRING,
    },
    bookingDate: {
      type: DataTypes.STRING,
    },
    bookingTime: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending',
    },
    totalPrice: {
      type: DataTypes.FLOAT,
    },
  },
  {
    timestamps: true,
    tableName: 'bookings',
  }
);

export default Booking;
