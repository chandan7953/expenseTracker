import { useState, useContext, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import api from "../utils/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");

    if (newPassword.trim() !== confirmPassword.trim()) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const res = await api.post(`/password/reset/${token}`, { newPassword });

      if (res.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Server error. Please try again."
      );
    }
  };

  return (
    <div className="bg-teal-50 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-teal-700">
          Reset Password
        </h1>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition-all"
            >
              Reset Password
            </button>
          </form>
        )}

        {success && (
          <div className="text-center space-y-4 mt-4">
            <p className="text-green-600 font-semibold text-lg">
              ✅ Password Reset Successful
            </p>
            <p className="text-gray-600">
              You can now log in with your new password.
            </p>

            <Link
              to="/"
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
            >
              Back to Login
            </Link>
          </div>
        )}

        {message && <p className="text-center text-red-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
