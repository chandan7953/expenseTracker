document.addEventListener("DOMContentLoaded", async () => {
  const dashboardSection = document.getElementById("dashboardSection");
  const unauthorizedSection = document.getElementById("unauthorized");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ 1. Check if user is logged in
  try {
    const response = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    const user = response.data.user;
    userInfo.textContent = `Hello, ${user.username}!`;
    dashboardSection.classList.remove("hidden");
  } catch (error) {
    unauthorizedSection.classList.remove("hidden");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  // ✅ 2. Handle logout
  logoutBtn.addEventListener("click", async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/logout",
        {},
        { withCredentials: true }
      );

      alert(response.data.message);
      window.location.href = "login.html";
    } catch (error) {
      const message =
        error.response?.data?.message || "Logout failed. Try again.";
      alert(message);
    }
  });
});
