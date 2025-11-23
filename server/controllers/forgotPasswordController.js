const { Users, ForgotPasswordRequests } = require("../models");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const FRONTEND_URL = process.env.FRONTEND_URL;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const request = await ForgotPasswordRequests.create({
      userId: user.id,
      isActive: true,
    });

    const resetToken = request.id;
    const resetLink = `${FRONTEND_URL}/resetpassword?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT == 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const emailData = {
      from: `"Expense Tracker" <${SENDER_EMAIL}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color:blue">${resetLink}</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    };

    await transporter.sendMail(emailData);

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function resetPassword(req, res) {
  const token = req.params.token;
  const { newPassword } = req.body;

  try {
    const request = await ForgotPasswordRequests.findOne({
      where: { id: token, isActive: true },
    });

    if (!request)
      return res.status(400).json({ message: "Invalid or expired link" });

    const user = await Users.findByPk(request.userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
};
