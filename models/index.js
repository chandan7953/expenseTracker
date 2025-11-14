const sequelize = require("../config/db");
const Expense = require("./Expense");
const ForgotPasswordRequests = require("./ForgotPasswordRequests");
const UserPro = require("./UserPro");
const Users = require("./Users");

Users.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(Users, { foreignKey: "userId" });

UserPro.belongsTo(Users, { foreignKey: "userId", onDelete: "CASCADE" });
Users.hasOne(UserPro, { foreignKey: "userId" });

ForgotPasswordRequests.belongsTo(Users, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Users.hasMany(ForgotPasswordRequests, { foreignKey: "userId" });

module.exports = { sequelize, Users, Expense, UserPro, ForgotPasswordRequests };
