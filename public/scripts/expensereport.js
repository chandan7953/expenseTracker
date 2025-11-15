let expensesData = [];
function formatDateLocal(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

const today = new Date();
const previousMonthFirst = new Date(
  today.getFullYear(),
  today.getMonth() - 1,
  1
);
document.getElementById("startDate").value =
  formatDateLocal(previousMonthFirst);
document.getElementById("endDate").value = formatDateLocal(today);

function renderTable(data) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  let total = 0;

  if (!data || data.length === 0) {
    body.innerHTML = `<tr><td colspan="4" class="p-4 text-gray-500 text-center">No records found</td></tr>`;
    document.getElementById("total").textContent = "Total: 0";
    document.getElementById("downloadBtn").classList.add("hidden");
    return;
  }

  let lastDate = null;
  data.forEach((item) => {
    const date = item.createdAt.slice(0, 10);
    if (lastDate && date !== lastDate)
      body.innerHTML += `<tr class="border-b"><td colspan="4" class="p-2"></td></tr>`;
    body.innerHTML += `<tr class="border-b">
            <td class="p-3">${date}</td>
            <td class="p-3">${item.amount}</td>
            <td class="p-3">${item.description}</td>
            <td class="p-3">${item.category}</td>
          </tr>`;
    total += item.amount;
    lastDate = date;
  });

  document.getElementById("total").textContent = `Total: ${total}`;
  document.getElementById("downloadBtn").classList.remove("hidden");
}

async function loadExpenses() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const userId = 2;

  document.getElementById("loader").classList.remove("hidden");

  try {
    const res = await axios.get(
      "http://localhost:3000/api/expenses/getExpensesByDate",
      { params: { startDate, endDate } }
    );
    expensesData = res.data.expenses;
    document.getElementById("mainContent").classList.remove("hidden");
    renderTable(expensesData);
  } catch (err) {
    if (err.response && err.response.status === 403) {
      document.getElementById("proCard").classList.remove("hidden");
    } else {
      console.error(err);
      renderTable([]);
      document.getElementById("mainContent").classList.remove("hidden");
    }
  }

  document.getElementById("loader").classList.add("hidden");
}

document.getElementById("filterBtn").addEventListener("click", loadExpenses);
loadExpenses();

document.getElementById("downloadBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  doc.setFontSize(16);
  doc.text("Expense Report", 14, 20);
  doc.setFontSize(12);
  doc.text(`From: ${startDate} To: ${endDate}`, 14, 30);

  const tableColumn = ["Date", "Amount", "Description", "Category"];
  const tableRows = [];
  let total = 0;

  expensesData.forEach((exp) => {
    tableRows.push([
      exp.createdAt.slice(0, 10),
      String(exp.amount),
      exp.description,
      exp.category,
    ]);
    total += exp.amount;
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { halign: "left" },
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.text(`Total: ${total}`, 14, doc.lastAutoTable.finalY + 10);
  doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
});
