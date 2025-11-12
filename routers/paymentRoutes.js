const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getUserProStatus,
} = require("../controllers/paymentController");
const authenticate = require("../middlewares/authMiddleware");

router.post("/create", authenticate, createOrder);
router.get("/payment-status/:orderId", verifyPayment);
router.get("/:userId", getUserProStatus);

module.exports = router;
