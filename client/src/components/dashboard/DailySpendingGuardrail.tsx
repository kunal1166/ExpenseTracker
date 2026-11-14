
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Pencil,
  Loader2,
  Wallet,
  Save,
} from "lucide-react";

import { usePreferences } from "../../context/PreferencesContext";

import {
  fetchDailyLimit,
  updateDailyLimit,
  type DailyLimitData,
  type DailySpending,
} from "../../api/dailyLimit";

interface DailySpendingGuardrailProps {
  refreshKey?: number;
}

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const DailySpendingGuardrail = ({
  refreshKey = 0,
}: DailySpendingGuardrailProps) => {
  const { currency, formatCurrency } = usePreferences();
  const [dailyLimit, setDailyLimit] = useState<DailyLimitData | null>(null);
  const [spending, setSpending] = useState<DailySpending | null>(null);

  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");

      const data = await fetchDailyLimit();

      setDailyLimit(data.dailyLimit);
      setSpending(data.spending);
      setAmount(
        data.dailyLimit.isSet ? String(data.dailyLimit.amount) : ""
      );
    } catch (err) {
      console.error("Daily guardrail error:", err);
      setError("Unable to load daily spending information.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically reload when refreshKey changes.
  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleSave = async () => {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("Please enter a valid daily limit.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateDailyLimit(value);
      await loadData();

      setEditing(false);
      setSuccess("Daily spending limit saved successfully.");
    } catch (err) {
      console.error("Save daily limit error:", err);
      setError("Unable to save daily spending limit.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-gray-500">
          Loading spending information...
        </span>
      </div>
    );
  }

  const status = spending?.status ?? "not_set";

  const statusConfig = {
    not_set: {
      label: "Limit not set",
      message: "Set a daily limit to monitor your spending.",
      icon: Wallet,
      color: "text-gray-600",
      bg: "bg-gray-100",
      bar: "bg-gray-400",
    },
    safe: {
      label: "Within your limit",
      message: "Good job! Your spending is under control.",
      icon: ShieldCheck,
      color: "text-green-700",
      bg: "bg-green-50",
      bar: "bg-green-500",
    },
    warning: {
      label: "Spending warning",
      message: "You have used at least 80% of your daily limit.",
      icon: AlertTriangle,
      color: "text-amber-700",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
    },
    exceeded: {
      label: "Daily limit exceeded",
      message: "You have crossed your daily spending limit.",
      icon: ShieldAlert,
      color: "text-red-700",
      bg: "bg-red-50",
      bar: "bg-red-500",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const percentage = spending?.percentageUsed ?? 0;
  const progressWidth = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Daily Spending Guardrail
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Keep your daily expenses under control
            </p>
          </div>
        </div>

        {dailyLimit?.isSet && !editing && (
          <button
            onClick={() => {
              setEditing(true);
              setError("");
              setSuccess("");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* Error and success */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Set or edit limit */}
      {(!dailyLimit?.isSet || editing) && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Your daily spending limit ({currencySymbols[currency] || currency})
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount, e.g. 1000"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Daily Limit"}
          </button>

          {dailyLimit?.isSet && (
            <button
              onClick={() => {
                setEditing(false);
                setAmount(String(dailyLimit.amount));
                setError("");
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Spending summary */}
      {dailyLimit?.isSet && spending && !editing && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Today's spending</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {formatCurrency(spending.totalSpent)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Daily limit</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {formatCurrency(dailyLimit.amount)}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Budget usage
              </span>

              <span className={`text-sm font-semibold ${config.color}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          {/* Remaining amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {spending.remaining >= 0
                ? "Remaining amount"
                : "Amount over limit"}
            </span>

            <span
              className={`font-semibold ${
                spending.remaining < 0
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
              {formatCurrency(Math.abs(spending.remaining))}
            </span>
          </div>

          {/* Status */}
          <div className={`flex items-start gap-3 rounded-lg p-3 ${config.bg}`}>
            <StatusIcon className={`mt-0.5 h-5 w-5 ${config.color}`} />

            <div>
              <p className={`text-sm font-semibold ${config.color}`}>
                {config.label}
              </p>
              <p className={`mt-1 text-xs ${config.color}`}>
                {config.message}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            {spending.transactionCount} expense transaction(s) counted today.
          </p>
        </div>
      )}
    </div>
  );
};

export default DailySpendingGuardrail;
