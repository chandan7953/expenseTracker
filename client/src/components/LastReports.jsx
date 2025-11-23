import api from "../utils/api";

function LastReports({ reports }) {
  const handleDownloadReport = async (id) => {
    try {
      const res = await api.get(`/reports/download/${id}`);
      const { downloadUrl } = res.data;
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Failed to open report:", err);
      alert("Failed to open report");
    }
  };

  if (!reports?.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Last 5 Reports</h2>
      <ul className="space-y-2">
        {reports.map((report) => (
          <li
            key={report.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
          >
            <span>{new Date(report.createdAt).toLocaleString()}</span>
            <button
              onClick={() => handleDownloadReport(report.id)}
              className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LastReports;
