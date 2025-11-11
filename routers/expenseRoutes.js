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
router.get("/", getAllExpense);
router.put("/edit", editExpense);
router.delete("/delete/:id", deleteExpense);

module.exports = router;
