document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const expenseForm = document.getElementById("expenseForm");
  const expenseList = document.getElementById("expenseList");
  const paginationList = document.getElementById("paginationList");

  let userId = null;
  let currentPage = 1;
  let limit = 5;
  let editId = null;

  const getQueryParam = (name, defaultValue) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || defaultValue;
  };

  currentPage = parseInt(getQueryParam("page", "1"));
  limit = parseInt(getQueryParam("limit", "5"));
  userId = getQueryParam("userId", null);

  try {
    const response = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    userId = response.data.user.id;
    fetchExpenses(currentPage, limit, userId);
  } catch (error) {
    window.location.href = "login.html";
    return;
  }

  logoutBtn.addEventListener("click", async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "login.html";
    } catch (error) {
      alert("Logout failed. Try again.");
    }
  });

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
    } catch (error) {
      alert("Failed to save expense.");
    }
  });

  async function fetchExpenses(page = 1, limit = 5, userId) {
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
      expenseList.innerHTML = `<li class="text-center text-gray-500">No expenses found.</li>`;
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
          <button onclick="editExpense('${exp.id}','${exp.amount}','${exp.description}','${exp.category}')" 
            id="edit-${exp.id}"
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
          <button onclick="deleteExpense('${exp.id}')" 
            id="delete-${exp.id}"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
        </div>
      `;
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
    if (!confirm("Are you sure you want to delete this expense?")) return;
    await axios.delete(`http://localhost:3000/api/expenses/delete/${id}`);
    fetchExpenses(currentPage, limit, userId);
  };
});
