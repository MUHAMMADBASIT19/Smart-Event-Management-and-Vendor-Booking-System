import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'messages',
  }
);

export default Message;
