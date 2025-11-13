const {
  createPaymentOrder,
  getPaymentStatus,
} = require("../services/paymentService");
const { UserPro, Users } = require("../models");

// 🧾 Create Payment Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, phone } = req.body;
    const user = req.user;

    const orderId = "order_" + Date.now();

    // 1️⃣ Create order in Cashfree
    const orderData = await createPaymentOrder(
      user.id,
      amount,
      currency,
      orderId,
      phone
    );

    // 2️⃣ Save initial record in DB
    await UserPro.create({
      userId: user.id,
      orderId,
      orderAmount: amount,
      paymentStatus: "PENDING",
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// ✅ Verify Payment and update User’s Pro status
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1️⃣ Get latest payment status from Cashfree
    const status = await getPaymentStatus(orderId);

    // 2️⃣ Find payment record
    const userPro = await UserPro.findOne({ where: { orderId } });
    if (!userPro)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // 3️⃣ Handle payment result
    if (status === "Success") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30-day Pro

      // Update order record
      await userPro.update({ paymentStatus: "SUCCESS" });

      // ✅ Update user's expiry date in Users table
      await Users.update({ expiryDate }, { where: { id: userPro.userId } });
    } else {
      await userPro.update({ paymentStatus: status.toUpperCase() });
    }

    res.status(200).json({
      success: true,
      message: `Payment ${status}`,
      data: userPro,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify payment" });
  }
};

// 🧠 Get user's Pro status
exports.getUserProStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findByPk(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isProActive =
      user.expiryDate && new Date(user.expiryDate) > new Date();

    res.status(200).json({
      success: true,
      isPro: isProActive,
      expiryDate: user.expiryDate || null,
    });
  } catch (error) {
    console.error("Error fetching Pro status:", error);
    res.status(500).json({ message: "Failed to fetch Pro status" });
  }
};
