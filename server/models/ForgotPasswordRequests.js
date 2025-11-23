// models/ForgotPasswordRequests.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { Users } = require("./Users");

const ForgotPasswordRequests = sequelize.define(
  "ForgotPasswordRequests",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

module.exports = ForgotPasswordRequests;
