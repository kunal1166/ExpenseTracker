import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Budget, CreateBudgetPayload } from "../../api/budget";
import { usePreferences } from "../../context/PreferencesContext";

interface BudgetModalProps {
  onClose: () => void;
  onSave: (data: CreateBudgetPayload) => Promise<void>;
  editingBudget?: Budget | null;
}

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export default function BudgetModal({
  onClose,
  onSave,
  editingBudget,
}: BudgetModalProps) {
  const { currency } = usePreferences();
  const now = new Date();

  const [category, setCategory] = useState(
    editingBudget?.category || "Food"
  );
  const [amount, setAmount] = useState(
    editingBudget ? String(editingBudget.amount) : ""
  );
  const [month, setMonth] = useState(
    String(editingBudget?.month || now.getMonth() + 1)
  );
  const [year, setYear] = useState(
    String(editingBudget?.year || now.getFullYear())
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSave({
        category,
        amount: numericAmount,
        month: Number(month),
        year: Number(year),
      });

      onClose();
    } catch {
      setError("Unable to save budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {editingBudget ? "Edit Budget" : "Create Budget"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set your monthly spending limit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close budget dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={!!editingBudget}
              className={inputClass}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {editingBudget && (
              <p className="mt-1 text-xs text-slate-400">
                Category cannot be changed while editing.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Budget Amount ({currencySymbols[currency] || currency})
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Month
              </label>

              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                disabled={!!editingBudget}
                className={inputClass}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(2000, index).toLocaleString("en-IN", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Year
              </label>

              <input
                type="number"
                min="2020"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                disabled={!!editingBudget}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : editingBudget
                ? "Update Budget"
                : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
