
import { useEffect, useState, type FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import { usePreferences } from "../../context/PreferencesContext";

import type {
  NewTransaction,
  Transaction,
  TransactionType,
} from "../../types/transaction";

import {
  fetchCategories,
  type Category,
} from "../../api/category";

interface Props {
  onClose: () => void;
  onAdd: (transaction: NewTransaction) => void | Promise<void>;
  editingTransaction?: Transaction | null;
  onUpdate?: (
    id: string,
    transaction: NewTransaction
  ) => void | Promise<void>;
}

const initialForm: NewTransaction = {
  title: "",
  amount: 0,
  type: "expense",
  category: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function AddTransactionModal({
  onClose,
  onAdd,
  editingTransaction,
  onUpdate,
}: Props) {
  const { currency } = usePreferences();
  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const isEditing = Boolean(editingTransaction);

  const [form, setForm] = useState<NewTransaction>(() =>
    editingTransaction
      ? {
          title: editingTransaction.title,
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          category: editingTransaction.category,
          date: editingTransaction.date,
        }
      : initialForm
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load categories from backend
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        setCategoryError("");

        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategoryError("Unable to load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    }

    void loadCategories();
  }, []);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === form.type
  );

  // Select first available category for new transactions
  useEffect(() => {
    if (categoriesLoading || categories.length === 0) return;

    const availableCategories = categories.filter(
      (category) => category.type === form.type
    );

    if (availableCategories.length === 0) {
      setForm((current) => ({
        ...current,
        category: "",
      }));
      return;
    }

    const currentCategoryExists = availableCategories.some(
      (category) => category.name === form.category
    );

    if (!currentCategoryExists) {
      setForm((current) => ({
        ...current,
        category: isEditing ? current.category : availableCategories[0].name,
      }));
    }
  }, [
    categories,
    categoriesLoading,
    form.type,
    form.category,
    isEditing,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!Number.isFinite(form.amount) || form.amount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!form.category.trim()) {
      setError("Please select a category.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: NewTransaction = {
        ...form,
        title: form.title.trim(),
      };

      if (editingTransaction && onUpdate) {
        await onUpdate(editingTransaction.id, payload);
      } else {
        await onAdd(payload);
      }
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setError("Unable to save transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateType(value: TransactionType) {
    const availableCategories = categories.filter(
      (category) => category.type === value
    );

    setForm((current) => ({
      ...current,
      type: value,
      category: availableCategories[0]?.name ?? "",
    }));
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="transaction-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              {isEditing ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update your financial activity."
                : "Record your income or expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Transaction Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Transaction title
            </label>

            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Grocery shopping"
              className={inputClass}
            />
          </div>

          {/* Amount and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount ({currencySymbols[currency] || currency})
              </label>

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: Number(e.target.value),
                  })
                }
                placeholder="500"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type
              </label>

              <select
                value={form.type}
                onChange={(e) =>
                  updateType(e.target.value as TransactionType)
                }
                className={inputClass}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                required
                value={form.category}
                disabled={categoriesLoading || filteredCategories.length === 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className={`${inputClass} disabled:bg-slate-100`}
              >
                {categoriesLoading ? (
                  <option value="">Loading categories...</option>
                ) : filteredCategories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  <>
                    {/* Preserve old category when editing */}
                    {isEditing &&
                      form.category &&
                      !filteredCategories.some(
                        (category) => category.name === form.category
                      ) && (
                        <option value={form.category}>
                          {form.category} (Existing)
                        </option>
                      )}

                    {filteredCategories.map((category) => (
                      <option
                        key={category._id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {categoryError && (
                <p className="mt-1 text-xs text-red-600">
                  {categoryError}
                </p>
              )}

              {!categoryError && !categoriesLoading && (
                <p className="mt-1 text-xs text-slate-400">
                  {filteredCategories.length} categories available
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>

              <input
                required
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || categoriesLoading || !form.category}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Transaction"
                  : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
