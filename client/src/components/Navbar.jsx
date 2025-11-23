import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import api from "../utils/api";

export default function Navbar() {
  const { userId, refreshAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const activeClass = "border-b-2 border-red-500";

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      await refreshAuth();
      navigate("/");
    } catch {
      alert("Logout failed");
    }
  };

  return (
    <nav className="bg-teal-700 p-4 flex justify-between items-center text-white">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold">Expense Tracker</h1>

        {userId && (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `font-medium hover:text-gray-200 ${isActive ? activeClass : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `font-medium hover:text-gray-200 ${isActive ? activeClass : ""}`
              }
            >
              Leaderboard
            </NavLink>

            <NavLink
              to="/report"
              className={({ isActive }) =>
                `font-medium hover:text-gray-200 ${isActive ? activeClass : ""}`
              }
            >
              Report
            </NavLink>
          </>
        )}
      </div>

      {userId && (
        <button
          onClick={handleLogout}
          className="bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
