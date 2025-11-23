import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import { useState, useContext, useEffect } from "react";
import api from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      navigate("/home");
    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return alert("Enter your email");

    setLoading(true);

    try {
      await api.post("/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="bg-white shadow-2xl rounded-2xl w-96 p-8">
        {!success && (
          <>
            <h2 className="text-2xl font-bold text-center text-teal-700 mb-6">
              Forgot Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />

              <button
                type="submit"
                className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition-all flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span>Sending...</span>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="text-center space-y-4">
            <p className="text-teal-700 font-semibold text-lg">
              ✅ Check your email
            </p>
            <p className="text-gray-600 text-sm">
              We have sent a password reset link to your email.
            </p>

            <Link
              to="/"
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
