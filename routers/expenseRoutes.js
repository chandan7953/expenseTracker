const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {
  addExpense,
  getAllExpense,
  editExpense,
  deleteExpense,
} = require("../controllers/expense");

const router = express.Router();

router.post("/add", addExpense);
router.post("/", getAllExpense);
router.post("/edit", editExpense);
router.post("/delete", deleteExpense);

module.exports = router;
