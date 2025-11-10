const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/users");
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

module.exports = {
  register,
  login,
  logout,
};
