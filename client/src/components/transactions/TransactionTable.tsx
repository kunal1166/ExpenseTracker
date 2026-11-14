import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Transaction } from "../../types/transaction";
import { usePreferences } from "../../context/PreferencesContext";

interface Props {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  const { formatCurrency, formatDate } = usePreferences();
  const showActions = Boolean(onEdit || onDelete);

  return (
    <section
      id="transactions"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-800">
            Recent Transactions
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Your latest financial activities
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {transactions.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>

              {showActions && (
                <th className="px-5 py-3 text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  {/* Transaction */}
                  <td className="px-5 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          item.type === "income"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {item.type === "income" ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>

                      {item.title}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 text-slate-600">
                    {item.category}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(item.date)}
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.type === "income"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`px-5 py-4 text-right font-semibold ${
                      item.type === "income"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </td>

                  {/* Actions */}
                  {showActions && (
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            aria-label={`Edit ${item.title}`}
                            title="Edit transaction"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            aria-label={`Delete ${item.title}`}
                            title="Delete transaction"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
