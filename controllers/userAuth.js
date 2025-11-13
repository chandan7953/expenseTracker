const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const existing = await Users.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await Users.create({
      username,
      email,
      phone,
      password: hashPass,
    });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "user registered Successfully",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering in",
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({
      message: "Error login in",
      error: err.message,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

const checkAuth = async (req, res) => {
  try {
    // req.user is already populated by your auth middleware
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isPro = false;

    if (user.expiryDate) {
      const now = new Date();
      if (new Date(user.expiryDate) > now) {
        isPro = true; // Pro plan is active
      } else {
        // Expired → reset expiryDate
        await user.update({ expiryDate: null });
      }
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      isPro,
      expiryDate: user.expiryDate,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Failed to verify user" });
  }
};

module.exports = {
  register,
  login,
  logout,
  checkAuth,
};
