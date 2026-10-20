import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderItems: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    shippingAddress: {
      type: DataTypes.JSON,
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    paymentResult: {
      type: DataTypes.JSON,
    },
    itemsPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    shippingPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    taxPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
    bookingDate: {
      type: DataTypes.STRING,
    },
    bookingTime: {
      type: DataTypes.STRING,
    },
    vendorId: {
      type: DataTypes.STRING,
    },
    clientId: {
      type: DataTypes.STRING,
    },
    specialArrangements: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    arrangementsPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'orders',
  }
);

export default Order;
