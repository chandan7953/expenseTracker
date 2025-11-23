function FilterSection({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  loadExpenses,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="font-semibold">Start Date</label>
        <input
          type="date"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="font-semibold">End Date</label>
        <input
          type="date"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={() => loadExpenses(startDate, endDate)}
          className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700"
        >
          Filter
        </button>
      </div>
    </div>
  );
}

export default FilterSection;
