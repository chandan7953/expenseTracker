const contentDiv = document.getElementById("content");
const homeTab = document.getElementById("homeTab");
const leaderboardTab = document.getElementById("leaderboardTab");
const reportTab = document.getElementById("reportTab");
const logoutBtn = document.getElementById("logoutBtn");

let user = null;
let userId = null;
let isPro = false;

function setActiveTab(tab) {
  [homeTab, leaderboardTab, reportTab].forEach((t) =>
    t.classList.remove("border-b-2", "border-red-500", "pb-1")
  );
  if (tab) tab.classList.add("border-b-2", "border-red-500", "pb-1");
}

function loadScript(src, callback) {
  const oldScript = document.getElementById("dynamicSectionScript");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.src = src;
  script.id = "dynamicSectionScript";
  script.onload = callback;
  document.body.appendChild(script);
}

async function loadSection(file, tabName = "home", page = 1, limit = 5) {
  try {
    const res = await fetch(file);
    const html = await res.text();
    contentDiv.innerHTML = html;

    if (tabName === "home") setActiveTab(homeTab);
    else if (tabName === "leaderboard") setActiveTab(leaderboardTab);
    else if (tabName === "report") setActiveTab(reportTab);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabName);
    if (tabName === "home") {
      params.set("page", page);
      params.set("limit", limit);
      params.set("userId", userId);
    } else {
      params.delete("page");
      params.delete("limit");
      params.delete("userId");
    }
    window.history.replaceState({}, "", `?${params.toString()}`);

    const sectionBuyProBtn = contentDiv.querySelector("#buyProBtn");
    sectionBuyProBtn?.addEventListener("click", async () => {
      if (!user?.phone) return alert("User not loaded");
      const tab = new URLSearchParams(window.location.search).get("tab");
      try {
        const res = await axios.post(
          "http://localhost:3000/api/payment/create",
          { amount: 199, currency: "INR", phone: user.phone, tab },
          { withCredentials: true }
        );
        const { paymentSessionId } = res.data;

        const cashfree = Cashfree({ mode: "sandbox" });
        cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
      } catch (err) {
        console.error("Payment start failed", err);
        alert("Payment failed");
      }
    });

    if (file === "dashboard.html") {
      loadScript("./scripts/dashboard.js", () =>
        typeof initDashboard === "function"
          ? initDashboard(page, limit, userId)
          : null
      );
    } else if (file === "leaderboard.html") {
      loadScript("./scripts/leaderboard.js", () =>
        typeof initleaderboard === "function" ? initleaderboard() : null
      );
    } else if (file === "report.html") {
      loadScript("./scripts/report.js", () =>
        typeof initReport === "function" ? initReport() : null
      );
    }
  } catch (err) {
    console.error("Failed to load section:", err);
    contentDiv.innerHTML =
      '<p class="text-center text-red-500 mt-4">Failed to load section.</p>';
  }
}

homeTab.addEventListener("click", () => loadSection("dashboard.html", "home"));
leaderboardTab.addEventListener("click", () =>
  loadSection("leaderboard.html", "leaderboard")
);
reportTab.addEventListener("click", () => loadSection("report.html", "report"));

logoutBtn.addEventListener("click", async () => {
  try {
    await axios.post(
      "http://localhost:3000/api/logout",
      {},
      { withCredentials: true }
    );
    window.location.href = "login.html";
  } catch {
    alert("Logout failed");
  }
});

async function handleReturnedOrder() {
  const returnedOrderId = new URLSearchParams(window.location.search).get(
    "order_id"
  );
  if (!returnedOrderId) return;

  try {
    await axios.get(
      `http://localhost:3000/api/payment/payment-status/${returnedOrderId}`,
      { withCredentials: true }
    );

    const params = new URLSearchParams(window.location.search);
    params.delete("order_id");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );

    const authRes = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    user = authRes.data.user;
    isPro = authRes.data.isPro;

    if (typeof updateProUI === "function") updateProUI();
    if (typeof showLeaderboard === "function") showLeaderboard();
  } catch (err) {
    console.error("Payment verification failed", err);
  }
}

(async function initApp() {
  try {
    const authRes = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    user = authRes.data.user;
    userId = authRes.data.user.id;
    isPro = authRes.data.isPro;

    await handleReturnedOrder();

    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab") || "home";
    const page = parseInt(urlParams.get("page") || "1");
    const limit = parseInt(urlParams.get("limit") || "5");

    if (tab === "leaderboard") loadSection("leaderboard.html", "leaderboard");
    else if (tab === "report") loadSection("report.html", "report");
    else loadSection("dashboard.html", "home", page, limit);
  } catch {
    window.location.href = "login.html";
  }
})();
