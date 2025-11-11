document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const expenseForm = document.getElementById("expenseForm");
  const expenseList = document.getElementById("expenseList");
  const paginationList = document.getElementById("paginationList");

  let userId = null;
  let currentPage = 1;
  const limit = 5;
  let editId = null;

  // Check Auth
  try {
    const response = await axios.get("http://localhost:3000/api/check-auth", {
      withCredentials: true,
    });
    userId = response.data.user.id;
    fetchExpenses();
  } catch (error) {
    window.location.href = "login.html";
    return;
  }

  // Logout
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

  // Add / Update Expense
  expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    if (!amount || !description || !category) {
      alert("Please fill all fields.");
      return;
    }

    try {
      if (editId) {
        await axios.post("http://localhost:3000/api/expenses/edit", {
          id: editId,
          amount,
          description,
          category,
        });
        editId = null;
        e.target.querySelector("button[type='submit']").textContent = "Add";
      } else {
        await axios.post("http://localhost:3000/api/expenses/add", {
          amount,
          description,
          category,
          userId,
        });
      }

      expenseForm.reset();
      fetchExpenses(currentPage);
    } catch (error) {
      alert("Failed to save expense.");
    }
  });

  // Fetch Expenses (with pagination)
  async function fetchExpenses(page = 1) {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/expenses?page=${page}&limit=${limit}`,
        { userId }
      );

      const { expenses, currentPage: cp, totalPages } = res.data;
      currentPage = cp;

      renderExpenses(expenses);
      renderPagination(totalPages);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  }

  // Render Expenses in UL
  function renderExpenses(expenses) {
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
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
          <button onclick="editExpense('${exp.id}', '${exp.amount}', '${exp.description}', '${exp.category}')" 
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

  // Render Pagination
  function renderPagination(totalPages) {
    paginationList.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.innerHTML = `
        <button
          class="px-3 py-1 rounded-lg ${
            i === currentPage
              ? "bg-teal-600 text-white"
              : "bg-gray-200 text-teal-700 hover:bg-gray-300"
          }"
        >
          ${i}
        </button>
      `;
      li.addEventListener("click", () => fetchExpenses(i));
      paginationList.appendChild(li);
    }
  }

  // Global Edit and Delete functions (to be called via onclick)
  window.editExpense = function (id, amount, description, category) {
    document.getElementById("amount").value = amount;
    document.getElementById("description").value = description;
    document.getElementById("category").value = category;
    document.querySelector("#expenseForm button[type='submit']").textContent =
      "Update";
    editId = id;
  };

  window.deleteExpense = async function (id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.post("http://localhost:3000/api/expenses/delete", { id });
      fetchExpenses(currentPage);
    } catch (error) {
      alert("Failed to delete expense.");
    }
  };
});
