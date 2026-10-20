import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vendorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slugs: {
      type: DataTypes.STRING,
      unique: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    numberOfReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
    },
    reviews: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    specialArrangements: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    opening: {
      type: DataTypes.STRING,
    },
    closing: {
      type: DataTypes.STRING,
    },
    bookings: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
  },
  {
    timestamps: true,
    tableName: 'events',
  }
);

export default Event;
