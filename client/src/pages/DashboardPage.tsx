import { useEffect, useMemo, useState } from "react";
import { Plus, CalendarDays, Lightbulb } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/dashboard/StatCard";
import Charts from "../components/dashboard/Charts";
import DailySpendingGuardrail from "../components/dashboard/DailySpendingGuardrail";

import TransactionTable from "../components/transactions/TransactionTable";
import AddTransactionModal from "../components/transactions/AddTransactionModal";

import {
  fetchTransactions,
  createTransaction,
  fetchDashboardSummary,
} from "../api/transaction";

import type { DashboardSummary } from "../api/transaction";

import type {
  NewTransaction,
  Transaction,
} from "../types/transaction";

import { usePreferences } from "../context/PreferencesContext";

export default function DashboardPage() {
  const { formatDate } = usePreferences();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Refresh Daily Spending Guardrail after adding a transaction
  const [guardrailRefreshKey, setGuardrailRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Fetch dashboard data from backend
  async function loadDashboard() {
    try {
      setApiError("");

      const [transactionData, summaryData] = await Promise.all([
        fetchTransactions(),
        fetchDashboardSummary(),
      ]);

      setTransactions(transactionData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setApiError("Unable to load dashboard data. Please try again.");
    }
  }

  // Initial dashboard loading
  useEffect(() => {
    async function initializeDashboard() {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    }

    void initializeDashboard();
  }, []);

  // Dashboard summary values
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpense ?? 0;
  const balance = summary?.currentBalance ?? 0;

  // Search and sort transactions
  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((item) => {
        const query = search.toLowerCase();

        return (
          item.title.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search]);

  // Create transaction using backend API
  async function handleAddTransaction(data: NewTransaction) {
    try {
      setApiError("");

      await createTransaction(data);

      // Trigger Daily Spending Guardrail refresh
      setGuardrailRefreshKey((prev) => prev + 1);

      await loadDashboard();

      setShowModal(false);
    } catch (error) {
      console.error("Failed to create transaction:", error);

      setApiError("Unable to save transaction. Please try again.");

      throw error;
    }
  }

  const today = formatDate(new Date());

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar
          search={search}
          onSearchChange={setSearch}
        />

        <div id="dashboard" className="space-y-6 p-5 md:p-8">

          {/* Page Header */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Welcome back
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Financial Overview
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here is your financial summary.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
                <CalendarDays size={17} />
                {today}
              </div>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Transaction
              </button>
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              Loading your dashboard...
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* Financial Summary Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Balance"
              amount={balance}
              description="Income minus expenses"
              type="balance"
            />

            <StatCard
              title="Total Income"
              amount={totalIncome}
              description="All recorded income"
              type="income"
            />

            <StatCard
              title="Total Expenses"
              amount={totalExpenses}
              description="All recorded expenses"
              type="expense"
            />
          </section>

          {/* Charts */}
          <Charts transactions={transactions} />

          {/* Transactions and Insights */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* Recent Transactions */}
            <div className="xl:col-span-2">
              <TransactionTable
                transactions={filteredTransactions}
              />
            </div>

            {/* Right Sidebar Cards */}
            <div className="space-y-5">

              {/* Spending Insight */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Lightbulb size={20} />
                  </div>

                  <h3 className="font-semibold text-slate-800">
                    Spending Insight
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  You have recorded{" "}
                  {summary?.totalTransactions ?? transactions.length}{" "}
                  transactions. Review your category-wise spending
                  to understand where your money goes.
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Basic demo insight. Data-driven insights will be
                  implemented in a later step.
                </p>
              </div>

              {/* Daily Spending Guardrail with Auto-Refresh */}
              <DailySpendingGuardrail
                refreshKey={guardrailRefreshKey}
              />

            </div>
          </section>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}
