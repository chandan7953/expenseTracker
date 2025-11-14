const {
  createPaymentOrder,
  getPaymentStatus,
} = require("../services/paymentService");
const { UserPro, Users, sequelize } = require("../models");

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, phone } = req.body;
    const user = req.user;
    const orderId = "order_" + Date.now();

    const orderData = await createPaymentOrder(
      user.id,
      amount,
      currency,
      orderId,
      phone
    );

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const status = await getPaymentStatus(orderId);
    const userPro = await UserPro.findOne({
      where: { orderId },
      transaction: t,
    });

    if (!userPro) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (status === "Success") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await Promise.all([
        userPro.update({ paymentStatus: "SUCCESS" }, { transaction: t }),
        Users.update(
          { expiryDate },
          { where: { id: userPro.userId }, transaction: t }
        ),
      ]);
    } else {
      await userPro.update(
        { paymentStatus: status.toUpperCase() },
        { transaction: t }
      );
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: `Payment ${status}`,
      data: userPro,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify payment" });
  }
};

exports.getUserProStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findByPk(userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isProActive = !!(
      user.expiryDate && new Date(user.expiryDate) > new Date()
    );

    res.status(200).json({
      success: true,
      isPro: isProActive,
      expiryDate: user.expiryDate || null,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch Pro status" });
  }
};
