const express = require("express");
const {
  register,
  login,
  logout,
  checkAuth,
} = require("../controllers/userAuth");
const authenticate = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check-auth", authenticate, checkAuth);

module.exports = router;
