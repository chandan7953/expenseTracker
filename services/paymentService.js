const { Cashfree, CFEnvironment } = require("cashfree-pg");
require("dotenv").config();

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

const createPaymentOrder = async (
  userId,
  amount,
  currency,
  orderId,
  phone,
  tab,
  expiryMinutes = 60
) => {
  try {
    const request = {
      order_amount: amount,
      order_currency: currency,
      order_id: orderId,
      customer_details: {
        customer_id: String(userId),
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/?tab=${tab}&order_id=${orderId}`,
        payment_methods: "cc,dc,upi",
      },
      order_expiry_time: new Date(
        Date.now() + expiryMinutes * 60 * 1000
      ).toISOString(),
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data;
  } catch (error) {
    console.error(
      "Cashfree create order failed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create payment order");
  }
};

const getPaymentStatus = async (orderId) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    if (payments.some((tx) => tx.payment_status === "SUCCESS"))
      return "Success";
    if (payments.some((tx) => tx.payment_status === "PENDING"))
      return "Pending";
    return "Failure";
  } catch (error) {
    console.error(
      "Cashfree fetch payment status failed:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch payment status");
  }
};

module.exports = { createPaymentOrder, getPaymentStatus };
