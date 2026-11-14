
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import TransactionTable from "../components/transactions/TransactionTable";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import { usePreferences } from "../context/PreferencesContext";

import {
  fetchTransactionsPage,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transaction";

import type {
  TransactionPagination,
} from "../api/transaction";

import type {
  Transaction,
  NewTransaction,
} from "../types/transaction";


const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Salary",
  "Freelance",
  "Investment",
  "Other",
];

const initialPagination: TransactionPagination = {
  currentPage: 1,
  limit: 10,
  totalTransactions: 0,
  totalPages: 0,
};

export default function TransactionsPage() {
  const { formatCurrency } = usePreferences();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] =
    useState<TransactionPagination>(initialPagination);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"" | "income" | "expense">("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await fetchTransactionsPage({
        search: search.trim() || undefined,
        type: type || undefined,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 10,
      });

      setTransactions(result.transactions);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError("Unable to load transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, type, category, startDate, endDate, page]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  async function handleAddTransaction(data: NewTransaction) {
    await createTransaction(data);

    setShowModal(false);
    setEditingTransaction(null);
    await loadTransactions();
  }

  async function handleUpdateTransaction(
    id: string,
    data: NewTransaction
  ) {
    await updateTransaction(id, data);

    setShowModal(false);
    setEditingTransaction(null);
    await loadTransactions();
  }

  async function handleDeleteTransaction(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTransaction(id);

      // If the current page has only one item, go to the previous page.
      if (transactions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTransactions();
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError("Unable to delete transaction. Please try again.");
    }
  }

  function resetFilters() {
    setSearch("");
    setType("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  function openAddModal() {
    setEditingTransaction(null);
    setShowModal(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setShowModal(true);
  }

  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <div className="space-y-6 p-5 md:p-8">
          {/* Page Header */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Financial Management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Transactions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage, search and review your income and expenses.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </section>

          {/* Summary */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Receipt size={21} />
                </div>

                <p className="text-sm text-slate-500">
                  Total Transactions
                </p>
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {pagination.totalTransactions}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  <Plus size={21} />
                </div>

                <p className="text-sm text-slate-500">
                  Current Page
                </p>
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {pagination.currentPage} / {totalPages}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
                  <Filter size={21} />
                </div>

                <p className="text-sm text-slate-500">
                  Records Per Page
                </p>
              </div>

              <p className="mt-4 text-2xl font-bold text-slate-900">
                {pagination.limit}
              </p>
            </div>
          </section>

          {/* Filters */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Filter Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Narrow down your financial records.
                </p>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <RefreshCw size={15} />
                Reset filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Search */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Search
                </label>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search title..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction Type
                </label>

                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as "" | "income" | "expense");
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  From Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  To Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Transaction List */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Transactions
                </h2>

                <p className="text-sm text-slate-500">
                  Showing {transactions.length} of{" "}
                  {pagination.totalTransactions} records
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading transactions...
              </div>
            ) : (
              <TransactionTable
                transactions={transactions}
                onEdit={openEditModal}
                onDelete={handleDeleteTransaction}
              />
            )}

            {/* Pagination */}
            {!loading && pagination.totalTransactions > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          onAdd={handleAddTransaction}
          editingTransaction={editingTransaction}
          onUpdate={handleUpdateTransaction}
        />
      )}
    </div>
  );
}
