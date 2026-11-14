
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Receipt,
  Film,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Gift,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryType,
} from "../api/category";

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Receipt,
  Film,
  Briefcase,
  Laptop,
  Building2,
  TrendingUp,
  Gift,
};

const availableIcons = Object.keys(iconMap);

const availableColors = [
  "#3b82f6",
  "#16a34a",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#64748b",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CategoryType>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [icon, setIcon] = useState("Wallet");
  const [color, setColor] = useState("#64748b");

  const loadCategories = useCallback(async () => {
    try {
      setError("");
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Unable to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setType("expense");
    setIcon("Wallet");
    setColor("#64748b");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIcon(category.icon || "Wallet");
    setColor(category.color || "#64748b");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: name.trim(),
        type,
        icon,
        color,
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, {
          name: payload.name,
          icon: payload.icon,
          color: payload.color,
        });
      } else {
        await createCategory(payload);
      }

      closeModal();
      await loadCategories();
    } catch (err) {
      console.error("Category save error:", err);
      setError("Unable to save category. It may already exist.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.isDefault) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteCategory(category._id);
      await loadCategories();
    } catch (err) {
      console.error("Category delete error:", err);
      setError("Unable to delete category.");
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesType = filter === "all" || category.type === filter;
    const matchesSearch = category.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const expenseCount = categories.filter(
    (category) => category.type === "expense"
  ).length;

  const incomeCount = categories.filter(
    (category) => category.type === "income"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar search={search} onSearchChange={setSearch} />

        <div className="space-y-6 p-5 md:p-8">
          {/* Header */}
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Organize your finances
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Category Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your income and expense categories.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Category
            </button>
          </section>

          {/* Summary */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Categories</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {categories.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Expense Categories</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {expenseCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Income Categories</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {incomeCount}
              </p>
            </div>
          </section>

          {/* Filters */}
          <section className="flex flex-wrap items-center gap-2">
            {(["all", "expense", "income"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item === "all" ? "All Categories" : item}
              </button>
            ))}
          </section>

          {/* Error */}
          {error && !showModal && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Category List */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-slate-900">
                Your Categories
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Default categories are protected from deletion.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No categories found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((category) => {
                  const Icon =
                    iconMap[category.icon] || Wallet;

                  return (
                    <div
                      key={category._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                          }}
                        >
                          <Icon size={21} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {category.type}
                            {category.isDefault ? " · Default" : " · Custom"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(category)}
                          disabled={category.isDefault}
                          title={
                            category.isDefault
                              ? "Default category cannot be deleted"
                              : "Delete category"
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Mobile & Internet"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category Type
                </label>

                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as CategoryType)
                  }
                  disabled={Boolean(editingCategory)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>

                {editingCategory && (
                  <p className="mt-1 text-xs text-slate-400">
                    Category type cannot be changed.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Icon
                </label>

                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {availableIcons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category Color
                </label>

                <div className="flex flex-wrap gap-3">
                  {availableColors.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColor(item)}
                      className={`h-8 w-8 rounded-full border-2 ${
                        color === item
                          ? "border-slate-900 ring-2 ring-slate-300"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: item }}
                      aria-label={`Select color ${item}`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
