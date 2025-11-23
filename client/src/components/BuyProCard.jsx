import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import api from "../utils/api";

function BuyProCard({ description, amount = 199, routename }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => resolve(window.Cashfree);
      script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
      document.head.appendChild(script);
    });
  };

  const handleReturnedOrder = async () => {
    const returnedOrderId = new URLSearchParams(window.location.search).get(
      "order_id"
    );
    if (!returnedOrderId) return;

    await api.get(`/payment/payment-status/${returnedOrderId}`);

    const params = new URLSearchParams(window.location.search);
    params.delete("order_id");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );

    await api.get("/check-auth");

    window.location.reload();
  };

  useEffect(() => {
    handleReturnedOrder();
  }, []);

  const handleBuyPro = async () => {
    if (!user?.phone) return;

    setLoading(true);
    try {
      const res = await api.post(
        "/payment/create",
        { amount, currency: "INR", phone: user.phone, routename, description },
        { withCredentials: true, timeout: 10000 }
      );

      const { paymentSessionId } = res.data;
      if (!paymentSessionId) throw new Error("Invalid response from server");

      const Cashfree = await loadCashfreeSDK();
      const cashfree = Cashfree({ mode: "sandbox" });
      cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="buyProCard" className="text-center">
      <h3 className="text-2xl font-semibold text-teal-700 mb-3">
        Unlock Pro Features 🚀
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        id="buyProBtn"
        onClick={handleBuyPro}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : `Buy Pro ₹${amount}`}
      </button>
    </div>
  );
}

export default BuyProCard;
