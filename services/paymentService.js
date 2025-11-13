const { Cashfree, CFEnvironment } = require("cashfree-pg");
require("dotenv").config();

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

const createPaymentOrder = async (userId, amount, currency, orderId, phone) => {
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
        return_url: `http://localhost:3000/home.html?order_id=${orderId}&tab=leaderboard`,
        payment_methods: "cc,dc,upi",
      },
      order_expiry_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to create Cashfree order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getPaymentStatus = async (orderId) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    let status;
    if (payments.some((tx) => tx.payment_status === "SUCCESS")) {
      status = "Success";
    } else if (payments.some((tx) => tx.payment_status === "PENDING")) {
      status = "Pending";
    } else {
      status = "Failure";
    }

    return status;
  } catch (error) {
    console.error(
      "Failed to fetch payment status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = { createPaymentOrder, getPaymentStatus };
