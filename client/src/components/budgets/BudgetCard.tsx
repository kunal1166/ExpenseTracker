import { Wallet, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Budget } from "../../api/budget";
import { usePreferences } from "../../context/PreferencesContext";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export default function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const { formatCurrency } = usePreferences();

  const progress = Math.min(budget.percentageUsed, 100);

  const progressColor = budget.exceeded
    ? "bg-red-500"
    : budget.percentageUsed >= 80
    ? "bg-amber-500"
    : "bg-blue-600";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Wallet size={21} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              {budget.category}
            </h3>
            <p className="text-xs text-slate-500">
              {new Date(budget.year, budget.month - 1).toLocaleDateString(
                "en-IN",
                { month: "long", year: "numeric" }
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
            aria-label="Edit budget"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(budget._id)}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete budget"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Spent</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(budget.spent)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Budget limit</p>
          <p className="mt-1 font-semibold text-slate-700">
            {formatCurrency(budget.amount)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-500">Budget used</span>
          <span className="font-semibold text-slate-700">
            {budget.percentageUsed}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Remaining</p>
          <p
            className={`mt-1 font-semibold ${
              budget.exceeded ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(budget.remaining)}
          </p>
        </div>

        {budget.exceeded && (
          <div className="flex items-center gap-1 text-xs font-medium text-red-600">
            <AlertTriangle size={15} />
            Budget exceeded
          </div>
        )}

        {!budget.exceeded && budget.percentageUsed >= 80 && (
          <div className="text-xs font-medium text-amber-600">
            Near budget limit
          </div>
        )}
      </div>
    </div>
  );
}
