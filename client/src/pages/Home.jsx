import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import api from "../utils/api";

function Home() {
  const { userId } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(5);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
  });

  const fetchExpenses = async (page = 1, limitPerPage = limit) => {
    if (!userId) return;

    try {
      const res = await api.get(
        `/expenses?page=${page}&limit=${limitPerPage}&userId=${userId}`
      );

      setExpenses(res.data.expenses);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);

      const params = new URLSearchParams();
      params.set("page", res.data.currentPage);
      params.set("limit", limitPerPage);
      params.set("userId", userId);
      window.history.replaceState({}, "", `?${params.toString()}`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userId, limit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { amount, description, category } = formData;

    if (!amount || !description || !category) {
      return alert("All fields required");
    }

    try {
      if (editId) {
        await api.put("/expenses/edit", {
          id: editId,
          amount,
          description,
          category,
        });
        setEditId(null);
      } else {
        await api.post("/expenses/add", {
          amount,
          description,
          category,
          userId,
        });
      }

      setFormData({ amount: "", description: "", category: "" });
      fetchExpenses(currentPage, limit);
    } catch {
      alert("Failed to save expense");
    }
  };

  const handleAISuggest = async () => {
    const description = formData.description.trim();
    if (!description) return alert("Enter a description first");

    try {
      const { data } = await api.post("/suggest-category", { description });
      if (data?.category) setFormData({ ...formData, category: data.category });
      else alert("AI could not suggest");
    } catch {
      alert("Failed to get AI suggestion");
    }
  };

  const handleEdit = (exp) => {
    setFormData({
      amount: exp.amount,
      description: exp.description,
      category: exp.category,
    });
    setEditId(exp.id);
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/delete/${id}`);
    if (expenses.length === 1 && currentPage > 1) {
      fetchExpenses(currentPage - 1, limit);
    } else {
      fetchExpenses(currentPage, limit);
    }
  };

  return (
    <section className="max-w-4xl mx-auto mt-10">
      <h3 className="text-xl font-semibold text-teal-600 mb-4">Add Expense</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-4 mb-8">
        <input
          type="number"
          placeholder="Amount"
          className="col-span-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <div className="col-span-3 flex">
          <input
            type="text"
            placeholder="Description"
            className="flex-1 border border-r-0 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <button
            type="button"
            className="bg-teal-600 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700 transition"
            onClick={handleAISuggest}
          >
            AI Auto-Category
          </button>
        </div>

        <select
          className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        >
          <option value="">Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Groceries">Groceries</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
          <option value="Rent">Rent</option>
          <option value="Income">Income</option>
          <option value="Other">Other</option>
        </select>

        <button
          type="submit"
          className="col-span-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition"
        >
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <div className="flex justify-end items-center gap-2 mb-4">
        <label className="text-gray-700 font-medium">Show:</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-gray-700 font-medium">per page</span>
      </div>

      <ul className="space-y-3 mb-8">
        {expenses.length === 0 && (
          <li className="text-center text-gray-500">No expenses found.</li>
        )}
        {expenses.map((exp) => (
          <li
            key={exp.id}
            className="flex justify-between items-center bg-gray-50 border p-3 rounded-lg shadow-sm"
          >
            <div>
              <p className="font-semibold text-teal-700">₹{exp.amount}</p>
              <p className="text-sm text-gray-600">
                {exp.description} — {exp.category}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(exp)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages && (
        <nav className="flex justify-center mt-6">
          <ul className="flex space-x-2">
            <li>
              <button
                disabled={currentPage === 1}
                onClick={() => fetchExpenses(currentPage - 1, limit)}
                className="px-3 py-1 rounded-lg bg-gray-200 text-teal-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
              <li key={i}>
                <button
                  onClick={() => fetchExpenses(i, limit)}
                  className={`px-3 py-1 rounded-lg ${
                    i === currentPage
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-teal-700 hover:bg-gray-300"
                  }`}
                >
                  {i}
                </button>
              </li>
            ))}

            <li>
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchExpenses(currentPage + 1, limit)}
                className="px-3 py-1 rounded-lg bg-gray-200 text-teal-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </section>
  );
}

export default Home;
