const express = require("express");
const router = express.Router();
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/forgotPasswordController");

router.post("/forgot-password", forgotPassword);

router.post("/password/reset/:token", resetPassword);

module.exports = router;
