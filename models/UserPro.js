const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Users = require("./Users");

const UserPro = sequelize.define(
  "UserPro",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isPro: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orderAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      defaultValue: "PENDING",
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = UserPro;
