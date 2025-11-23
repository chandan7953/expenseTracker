import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import BuyProCard from "../components/BuyProCard";
import api from "../utils/api";

import FilterSection from "../components/FilterSection";
import ExpenseTable from "../components/ExpenseTable";
import LastReports from "../components/LastReports";

function ExpenseReport() {
  const { isPro } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [lastReports, setLastReports] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const previousMonthFirst = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const formatDate = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    const start = formatDate(previousMonthFirst);
    const end = formatDate(today);

    setStartDate(start);
    setEndDate(end);

    if (isPro) {
      loadExpenses(start, end);
      loadLastReports();
    }
  }, [isPro]);

  const loadExpenses = async (start = startDate, end = endDate) => {
    if (!isPro) return;
    setLoading(true);
    try {
      const res = await api.get("/expenses/getExpensesByDate", {
        params: { startDate: start, endDate: end },
      });
      setExpenses(res.data.expenses || []);
    } catch {
      setExpenses([]);
    }
    setLoading(false);
  };

  const loadLastReports = async () => {
    try {
      const res = await api.get("/reports/list");
      console.log(res.data.reports);
      setLastReports(res.data.reports || []);
    } catch {
      setLastReports([]);
    }
  };

  if (!isPro) {
    return (
      <section className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-teal-700 mb-4">
          Expense Report
        </h1>
        <BuyProCard
          description="You need a Pro subscription to view this report."
          amount={199}
          routename="report"
        />
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-teal-700 mb-4">Expense Report</h1>

      <FilterSection
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        loadExpenses={loadExpenses}
      />

      <ExpenseTable
        expenses={expenses}
        loading={loading}
        startDate={startDate}
        endDate={endDate}
        reloadReports={loadLastReports}
      />

      <LastReports reports={lastReports} />
    </section>
  );
}

export default ExpenseReport;
