const { Op, fn, col, literal } = require("sequelize");
const { Users, Expense, UserPro } = require("../models");

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
  } catch (err) {
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

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalItems: count,
      expenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const editExpense = async (req, res) => {
  try {
    const { id, amount, description, category } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    expense.amount = amount ?? expense.amount;
    expense.description = description ?? expense.description;
    expense.category = category ?? expense.category;

    await expense.save();

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await expense.destroy();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

const getTopUsers = async (req, res) => {
  try {
    const { userId } = req.query;
    const today = new Date();

    // 1️⃣ Check if current user has a valid Pro subscription
    const currentUserPro = await UserPro.findOne({
      where: {
        userId,
        paymentStatus: "SUCCESS",
        expiryDate: { [Op.gte]: today },
      },
    });

    if (!currentUserPro) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Pro membership required to view leaderboard.",
      });
    }

    // 2️⃣ Get top 10 users by total expense (regardless of Pro status)
    const topUsers = await Users.findAll({
      attributes: [
        "id",
        "username",
        [fn("SUM", col("Expenses.amount")), "totalExpense"],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["users.id"],
      order: [[literal("totalExpense"), "DESC"]],
      limit: 10,
    });

    res.status(200).json({ success: true, topUsers });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
  getTopUsers,
};
