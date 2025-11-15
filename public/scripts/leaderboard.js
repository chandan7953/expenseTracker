async function initleaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  const leaderboardList = document.getElementById("leaderboardList");

  if (!isPro) {
    buyProCard?.classList.remove("hidden");
    leaderboard?.classList.add("hidden");
    return;
  }

  buyProCard?.classList.add("hidden");
  leaderboard?.classList.remove("hidden");

  async function fetchLeaderboard() {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/expenses/leaderboard",
        { withCredentials: true }
      );
      const topUsers = res.data;
      console.log(topUsers);
      leaderboardList.innerHTML = "";
      topUsers.forEach((u) => {
        const li = document.createElement("li");
        li.className = "flex justify-between p-3 border-b";
        li.innerHTML = `<span>${u.username}</span><span>₹${u.totalExpenses}</span>`;
        leaderboardList.appendChild(li);
      });
    } catch (err) {
      console.log(err.response?.data?.message || "Cannot fetch leaderboard");
    }
  }
  fetchLeaderboard();
}
