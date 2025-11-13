const { fn, col } = require("sequelize");
const { Users, Expense } = require("../models");

const addExpense = async (req, res) => {
  try {
    const { amount, description, category, userId } = req.body;
    const expense = await Expense.create({
      amount,
      description,
      category,
      userId,
    });
    res.status(201).json(expense);
  } catch {
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
  try {
    const { id, amount, description, category } = req.body;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    Object.assign(expense, {
      amount: amount ?? expense.amount,
      description: description ?? expense.description,
      category: category ?? expense.category,
    });

    await expense.save();
    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch {
    res.status(500).json({ error: "Failed to update expense" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    await expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user?.expiryDate || new Date(user.expiryDate) <= new Date())
      return res.status(403).json({ message: "Access denied" });

    const topUsers = await Expense.findAll({
      attributes: ["userId", [fn("SUM", col("amount")), "totalExpenses"]],
      include: [{ model: Users, attributes: ["username"] }],
      group: ["userId", "User.id"],
      order: [[fn("SUM", col("amount")), "DESC"]],
      limit: 10,
      raw: true,
      nest: true,
    });

    const leaderboard = topUsers.map((u) => ({
      username: u.User.username,
      totalExpenses: parseFloat(u.totalExpenses).toFixed(2),
    }));

    res.status(200).json(leaderboard);
  } catch {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
  getLeaderboard,
};
