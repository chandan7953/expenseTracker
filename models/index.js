const sequelize = require("../config/db");
const Expense = require("./Expense");
const Users = require("./Users");

Users.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
Expense.belongsTo(Users, { foreignKey: "userId" });

module.exports = { sequelize, Users, Expense };
