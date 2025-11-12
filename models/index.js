const sequelize = require("../config/db");
const Expense = require("./Expense");
const UserPro = require("./UserPro");
const Users = require("./Users");

Users.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(Users, { foreignKey: "userId" });

UserPro.belongsTo(Users, { foreignKey: "userId", onDelete: "CASCADE" });
Users.hasOne(UserPro, { foreignKey: "userId" });

module.exports = { sequelize, Users, Expense, UserPro };
