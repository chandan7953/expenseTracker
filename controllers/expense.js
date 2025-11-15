const { Users, Expense, sequelize } = require("../models");
const { Op } = require("sequelize");

const addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, description, category, userId } = req.body;

    const expense = await Expense.create(
      { amount, description, category, userId },
      { transaction: t }
    );

    const user = await Users.findByPk(userId, { transaction: t });
    if (user) {
      user.totalExpense += parseFloat(amount);
      await user.save({ transaction: t });
    }

    await t.commit();
    res.status(201).json(expense);
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
  }
};

const getAllExpense = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId },
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      expenses,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const editExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, amount, description, category } = req.body;
    const expense = await Expense.findByPk(id, { transaction: t });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    const oldAmount = parseFloat(expense.amount);
    const newAmount = parseFloat(amount);

    expense.amount = newAmount;
    expense.description = description;
    expense.category = category;
    await expense.save({ transaction: t });

    const user = await Users.findByPk(expense.userId, { transaction: t });
    if (user) {
      user.totalExpense = user.totalExpense - oldAmount + newAmount;
      await user.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

const deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id, { transaction: t });
    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    const amount = parseFloat(expense.amount);
    await expense.destroy({ transaction: t });

    const user = await Users.findByPk(expense.userId, { transaction: t });
    if (user) {
      user.totalExpense -= amount;
      if (user.totalExpense < 0) user.totalExpense = 0;
      await user.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user?.expiryDate || new Date(user.expiryDate) <= new Date())
      return res.status(403).json({ message: "Access denied" });

    const topUsers = await Users.findAll({
      attributes: ["username", "totalExpense"],
      order: [["totalExpense", "DESC"]],
      limit: 10,
    });

    const leaderboard = topUsers.map((u) => ({
      username: u.username,
      totalExpenses: parseFloat(u.totalExpense).toFixed(2),
    }));

    res.status(200).json(leaderboard);
  } catch {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

const getExpensesByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const user = await Users.findByPk(userId);

    if (!user?.expiryDate || new Date(user.expiryDate) <= new Date())
      return res.status(403).json({ message: "Access denied" });

    if (!startDate || !endDate || !userId) {
      return res.status(400).json({
        status: false,
        message: "startDate, endDate and userId are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Include end of day
    end.setHours(23, 59, 59, 999);
    const expenses = await Expense.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      status: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Expense fetch error:", error);

    // 🔴 Server Error
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
  getLeaderboard,
  getExpensesByDate,
};
