import { useCallback, useEffect, useState } from "react";
import { Plus, Wallet, TrendingUp, AlertTriangle } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetModal from "../components/budgets/BudgetModal";
import { usePreferences } from "../context/PreferencesContext";

import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budget";

import type {
  Budget,
  CreateBudgetPayload,
} from "../api/budget";

export default function BudgetPage() {
  const { formatCurrency } = usePreferences();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setError("");
      const data = await fetchBudgets();
      setBudgets(data);
    } catch (err) {
      console.error("Failed to load budgets:", err);
      setError("Unable to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBudgets();
  }, [loadBudgets]);

  async function handleSaveBudget(data: CreateBudgetPayload) {
    if (editingBudget) {
      await updateBudget(editingBudget._id, data.amount);
    } else {
      await createBudget(data);
    }

    setShowModal(false);
    setEditingBudget(null);
    await loadBudgets();
  }

  async function handleDeleteBudget(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      await deleteBudget(id);
      await loadBudgets();
    } catch (err) {
      console.error("Failed to delete budget:", err);
      setError("Unable to delete budget. Please try again.");
    }
  }

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + budget.amount,
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(search.toLowerCase())
  );

  const currentMonth = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar search={search} onSearchChange={setSearch} />

        <div className="space-y-6 p-5 md:p-8">
          {/* Page Header */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Financial Planning
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Monthly Budgets
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track and control your monthly spending.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBudget(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Budget
            </button>
          </section>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Wallet size={21} />
                </div>
                <p className="text-sm text-slate-500">Total Budget</p>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                  <TrendingUp size={21} />
                </div>
                <p className="text-sm text-slate-500">Total Spent</p>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  <Wallet size={21} />
                </div>
                <p className="text-sm text-slate-500">Remaining</p>
              </div>
              <p
                className={`mt-4 text-2xl font-bold ${
                  totalRemaining < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </section>

          {/* Budget List */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Budgets
                </h2>
                <p className="text-sm text-slate-500">
                  {currentMonth}
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {filteredBudgets.length} budgets
              </span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading budgets...
              </div>
            ) : filteredBudgets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Wallet size={32} className="mx-auto text-slate-400" />

                <h3 className="mt-3 font-semibold text-slate-800">
                  No budgets found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create a monthly budget to start tracking your spending.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBudget(null);
                    setShowModal(true);
                  }}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Create your first budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {filteredBudgets.map((budget) => (
                  <BudgetCard
                    key={budget._id}
                    budget={budget}
                    onEdit={(item) => {
                      setEditingBudget(item);
                      setShowModal(true);
                    }}
                    onDelete={handleDeleteBudget}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Exceeded Budget Warning */}
          {budgets.some((budget) => budget.exceeded) && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="shrink-0 text-red-600" size={22} />
              <p className="text-sm font-medium text-red-700">
                You have exceeded one or more category budgets. Review your spending.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Budget Modal */}
      {showModal && (
        <BudgetModal
          onClose={() => {
            setShowModal(false);
            setEditingBudget(null);
          }}
          onSave={handleSaveBudget}
          editingBudget={editingBudget}
        />
      )}
    </div>
  );
}
