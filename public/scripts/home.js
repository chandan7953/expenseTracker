document.addEventListener("DOMContentLoaded", async () => {
  const dashboardSection = document.getElementById("dashboardSection");
  const proSection = document.getElementById("proSection");
  const homeTab = document.getElementById("homeTab");
  const leaderboardTab = document.getElementById("leaderboardTab");
  const logoutBtn = document.getElementById("logoutBtn");
  const expenseForm = document.getElementById("expenseForm");
  const expenseList = document.getElementById("expenseList");
  const paginationList = document.getElementById("paginationList");
  const buyProBtn = document.getElementById("buyProBtn");
  const buyProCard = document.getElementById("buyProCard");
  const leaderboard = document.getElementById("leaderboard");
  const leaderboardList = document.getElementById("leaderboardList");

  const urlParams = new URLSearchParams(window.location.search);
  let user = null;
  let userId = null;
  let isPro = false;
  let currentPage = parseInt(urlParams.get("page") || "1");
  let limit = parseInt(urlParams.get("limit") || "5");
  let editId = null;

  // -------------------- TAB LOGIC --------------------
  function setActive(tab) {
    [homeTab, leaderboardTab].forEach((btn) =>
      btn.classList.remove("border-b-2", "border-red-500", "pb-1")
    );
    tab.classList.add("border-b-2", "border-red-500", "pb-1");
  }

  function showHome() {
    dashboardSection.classList.remove("hidden");
    proSection.classList.add("hidden");
    setActive(homeTab);
    const page = urlParams.get("page") || "1";
    const limit = urlParams.get("limit") || "5";
    const uid = urlParams.get("userId") || null;
    window.history.replaceState(
      {},
      "",
      `/?tab=home&page=${page}&limit=${limit}&userId=${uid}`
    );
  }

  async function showLeaderboard() {
    dashboardSection.classList.add("hidden");
    proSection.classList.remove("hidden");
    setActive(leaderboardTab);
    if (isPro) {
      await fetchLeaderboard();
    }
    window.history.replaceState({}, "", `/?tab=leaderboard`);
  }

  homeTab.addEventListener("click", showHome);
  leaderboardTab.addEventListener("click", showLeaderboard);

  const activeTab = urlParams.get("tab") || "home";

  // -------------------- FETCH AUTH --------------------
  try {
    const authRes = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    user = authRes.data.user;
    userId = user.id;
    isPro = authRes.data.isPro;
  } catch {
    window.location.href = "login.html";
    return;
  }

  if (activeTab === "leaderboard") showLeaderboard();
  else showHome();

  // -------------------- LOGOUT --------------------
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

  // -------------------- EXPENSES --------------------
  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    if (!amount || !description || !category)
      return alert("All fields required");

    try {
      if (editId) {
        await axios.put("http://localhost:3000/api/expenses/edit", {
          id: editId,
          amount,
          description,
          category,
        });
        editId = null;
        expenseForm.querySelector("button[type='submit']").textContent = "Add";
      } else {
        await axios.post("http://localhost:3000/api/expenses/add", {
          amount,
          description,
          category,
          userId,
        });
      }
      expenseForm.reset();
      fetchExpenses(currentPage, limit, userId);
    } catch {
      alert("Failed to save expense");
    }
  });

  async function fetchExpenses(page, limit, userId) {
    if (!userId) return;
    const res = await axios.get(
      `http://localhost:3000/api/expenses?page=${page}&limit=${limit}&userId=${userId}`
    );
    const { expenses, currentPage: cp, totalPages } = res.data;
    currentPage = cp;
    renderExpenses(expenses);
    renderPagination(totalPages);
    updateURL();
  }

  function renderExpenses(expenses) {
    expenseList.innerHTML = "";
    if (!expenses.length) {
      expenseList.innerHTML =
        '<li class="text-center text-gray-500">No expenses found.</li>';
      return;
    }
    expenses.forEach((exp) => {
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center bg-gray-50 border p-3 rounded-lg shadow-sm";
      li.innerHTML = `
        <div>
          <p class="font-semibold text-teal-700">₹${exp.amount}</p>
          <p class="text-sm text-gray-600">${exp.description} — ${exp.category}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="editExpense('${exp.id}','${exp.amount}','${exp.description}','${exp.category}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
          <button onclick="deleteExpense('${exp.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
        </div>`;
      expenseList.appendChild(li);
    });
  }

  function renderPagination(totalPages) {
    paginationList.innerHTML = "";
    const prev = document.createElement("li");
    prev.innerHTML = `<button class="px-3 py-1 rounded-lg bg-gray-200 text-teal-700 hover:bg-gray-300" ${
      currentPage === 1 ? "disabled" : ""
    }>Prev</button>`;
    prev.addEventListener("click", () => {
      if (currentPage > 1) fetchExpenses(currentPage - 1, limit, userId);
    });
    paginationList.appendChild(prev);

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);

    for (let i = start; i <= end; i++) {
      const li = document.createElement("li");
      li.innerHTML = `<button class="px-3 py-1 rounded-lg ${
        i === currentPage
          ? "bg-teal-600 text-white"
          : "bg-gray-200 text-teal-700 hover:bg-gray-300"
      }">${i}</button>`;
      li.addEventListener("click", () => fetchExpenses(i, limit, userId));
      paginationList.appendChild(li);
    }

    const next = document.createElement("li");
    next.innerHTML = `<button class="px-3 py-1 rounded-lg bg-gray-200 text-teal-700 hover:bg-gray-300" ${
      currentPage === totalPages ? "disabled" : ""
    }>Next</button>`;
    next.addEventListener("click", () => {
      if (currentPage < totalPages)
        fetchExpenses(currentPage + 1, limit, userId);
    });
    paginationList.appendChild(next);
  }

  function updateURL() {
    const params = new URLSearchParams();
    params.set("tab", "home");
    params.set("page", currentPage);
    params.set("limit", limit);
    params.set("userId", userId);
    window.history.replaceState({}, "", `?${params.toString()}`);
  }

  window.editExpense = function (id, amount, description, category) {
    document.getElementById("amount").value = amount;
    document.getElementById("description").value = description;
    document.getElementById("category").value = category;
    expenseForm.querySelector("button[type='submit']").textContent = "Update";
    editId = id;
  };

  window.deleteExpense = async function (id) {
    await axios.delete(`http://localhost:3000/api/expenses/delete/${id}`);
    fetchExpenses(currentPage, limit, userId);
  };

  // -------------------- BUY PRO --------------------
  function updateProUI() {
    if (isPro) {
      if (buyProCard) buyProCard.classList.add("hidden");
      if (leaderboard) leaderboard.classList.remove("hidden");
    } else {
      if (buyProCard) buyProCard.classList.remove("hidden");
      if (leaderboard) leaderboard.classList.add("hidden");
    }
  }

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
      alert(err.response?.data?.message || "Cannot fetch leaderboard");
    }
  }

  const returnedOrderId = urlParams.get("order_id");
  if (returnedOrderId) {
    try {
      await axios.get(
        `http://localhost:3000/api/payment/payment-status/${returnedOrderId}`,
        { withCredentials: true }
      );
      alert("Payment verified");
      urlParams.delete("order_id");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${urlParams.toString()}`
      );
      // Refresh Pro status
      const authRes = await axios.get("http://localhost:3000/api/check-auth", {
        withCredentials: true,
      });
      user = authRes.data.user;
      isPro = authRes.data.isPro;
      updateProUI();
      showLeaderboard();
    } catch (err) {
      console.error("Payment verify failed", err);
    }
  } else {
    updateProUI();
  }

  if (buyProBtn) {
    buyProBtn.addEventListener("click", async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/payment/create",
          { amount: 199, currency: "INR", phone: user.phone },
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
  }

  // -------------------- AI CATEGORY SUGGEST --------------------
  const aiSuggestBtn = document.getElementById("aiSuggestBtn");
  if (aiSuggestBtn) {
    aiSuggestBtn.addEventListener("click", async () => {
      const description = document.getElementById("description").value.trim();
      if (!description) return alert("Enter a description first");

      aiSuggestBtn.disabled = true;
      aiSuggestBtn.textContent = "Thinking...";

      try {
        const { data } = await axios.post(
          "http://localhost:3000/api/suggest-category",
          { description }
        );
        if (data?.category) {
          document.getElementById("category").value = data.category;
        } else {
          alert("AI could not suggest a category");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to get AI suggestion");
      } finally {
        aiSuggestBtn.disabled = false;
        aiSuggestBtn.textContent = "AI Auto-Category";
      }
    });
  }

  fetchExpenses(currentPage, limit, userId);
});
