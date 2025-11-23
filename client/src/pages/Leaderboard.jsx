import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import BuyProCard from "../components/BuyProCard";
import api from "../utils/api";

function Leaderboard() {
  const { isPro } = useContext(AuthContext);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPro) {
      fetchLeaderboard();
    }
  }, [isPro]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses/leaderboard");
      setTopUsers(res.data);
    } catch (err) {
      console.error(err.response?.data?.message || "Cannot fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      {!isPro && (
        <BuyProCard
          description="Get access to the leaderboard and premium features for just ₹199."
          amount={199}
          routename="leaderboard"
        />
      )}

      {isPro && (
        <div id="leaderboard">
          <h3 className="text-2xl font-semibold text-teal-700 mb-6 text-center">
            🏆 Top 10 Users by Total Expense
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading leaderboard...</p>
          ) : (
            <ul id="leaderboardList" className="divide-y divide-gray-200 mb-4">
              {topUsers.map((u, index) => (
                <li
                  key={u.userId || index}
                  className="flex justify-between p-3 border-b"
                >
                  <span>{u.username}</span>
                  <span>₹{u.totalExpenses}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default Leaderboard;
