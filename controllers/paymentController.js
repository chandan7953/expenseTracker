const {
  createPaymentOrder,
  getPaymentStatus,
} = require("../services/paymentService");
const { UserPro } = require("../models");

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
      isPro: false,
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

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const status = await getPaymentStatus(orderId);

    const userPro = await UserPro.findOne({ where: { orderId } });
    if (!userPro)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (status === "Success") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await userPro.update({
        isPro: true,
        paymentStatus: "SUCCESS",
        expiryDate,
      });
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

exports.getUserProStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch latest UserPro record for the user
    const userPro = await UserPro.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!userPro) {
      return res.status(200).json({ isPro: false });
    }

    const isProActive =
      userPro.isPro &&
      userPro.expiryDate &&
      new Date(userPro.expiryDate) > new Date();

    res.status(200).json({
      isPro: isProActive,
      expiryDate: userPro.expiryDate || null,
      orderId: userPro.orderId,
      paymentStatus: userPro.paymentStatus,
    });
  } catch (error) {
    console.error("Error fetching Pro status:", error);
    res.status(500).json({ message: "Failed to fetch Pro status" });
  }
};
