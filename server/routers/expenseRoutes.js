const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
  getLeaderboard,
  getExpensesByDate,
} = require("../controllers/expense");

const router = express.Router();

router.post("/add", addExpense);
router.get("/", getAllExpense);
router.put("/edit", editExpense);
router.delete("/delete/:id", deleteExpense);
router.get("/leaderboard", authenticate, getLeaderboard);
router.get("/getExpensesByDate", authenticate, getExpensesByDate);

module.exports = router;
