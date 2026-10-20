import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Bid = sequelize.define(
  'Bid',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acceptedPrice: {
      type: DataTypes.FLOAT,
    },
    VendorBid: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    UserBid: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bidStatus: {
      type: DataTypes.ENUM('accepted', 'rejected', 'ongoing'),
      defaultValue: 'ongoing',
    },
  },
  {
    timestamps: true,
    tableName: 'bids',
  }
);

export default Bid;
