const { Expense } = require("../models");

// ➕ Add Expense
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

// 📄 Get All Expenses (with pagination)
const getAllExpense = async (req, res) => {
  try {
    const { userId } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
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

// ✏️ Edit Expense (ID from body)
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

// 🗑️ Delete Expense (ID from body)
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.body;

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

module.exports = {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
};
