import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../utils/api";

function ExpenseTable({
  expenses,
  loading,
  startDate,
  endDate,
  reloadReports,
}) {
  const downloadAndUploadPDF = async () => {
    if (!expenses?.length) return alert("No data to download");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Expense Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`From: ${startDate} To: ${endDate}`, 14, 30);

    const tableColumn = ["Date", "Amount", "Description", "Category"];
    const tableRows = expenses.map((exp) => [
      exp.createdAt.slice(0, 10),
      exp.amount,
      exp.description,
      exp.category,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { halign: "left" },
      headStyles: { fillColor: [22, 160, 133] },
    });

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    doc.text(`Total: ${total}`, 14, doc.lastAutoTable.finalY + 10);

    const pdfBlob = doc.output("blob");

    const formData = new FormData();
    formData.append(
      "pdf",
      pdfBlob,
      `Expense_Report_${startDate}_to_${endDate}.pdf`
    );

    try {
      await api.post("/reports/upload", formData);
      reloadReports();
    } catch {
      alert("Upload failed");
    }

    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="mt-6 overflow-x-auto">
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Loading...</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-600 text-white text-center">
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-center">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="border-b">
                    <td className="p-3">{exp.createdAt.slice(0, 10)}</td>
                    <td className="p-3">{exp.amount}</td>
                    <td className="p-3">{exp.description}</td>
                    <td className="p-3">{exp.category}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {expenses.length > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={downloadAndUploadPDF}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
              >
                Download
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExpenseTable;
