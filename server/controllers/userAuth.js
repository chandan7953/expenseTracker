const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../models");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const existing = await Users.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

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
      secure: false,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch {
    res.status(500).json({ message: "Failed to register user" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch {
    res.status(500).json({ message: "Failed to login" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

const checkAuth = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let isPro = false;
    const now = new Date();

    if (user.expiryDate) {
      if (new Date(user.expiryDate) > now) {
        isPro = true;
      } else {
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
  } catch {
    res.status(500).json({ message: "Failed to verify user" });
  }
};

module.exports = {
  register,
  login,
  logout,
  checkAuth,
};
