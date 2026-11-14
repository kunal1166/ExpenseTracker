
import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { usePreferences } from "../context/PreferencesContext";

import {
  fetchDashboardSummary,
  fetchExpenseAnalytics,
  fetchMonthlyAnalytics,
} from "../api/transaction";

import type {
  DashboardSummary,
  ExpenseCategoryAnalytics,
  MonthlyAnalytics,
} from "../api/transaction";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#64748b",
  "#06b6d4",
  "#d946ef",
];


function getMonthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleString("en-IN", {
    month: "short",
  });
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: typeof Wallet;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={21} />
        </div>

        <p className="text-sm text-slate-500">{title}</p>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [search, setSearch] = useState("");
  const { formatCurrency } = usePreferences();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryData, setCategoryData] = useState<
    ExpenseCategoryAnalytics[]
  >([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyAnalytics[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResult, categoryResult, monthlyResult] =
        await Promise.all([
          fetchDashboardSummary(),
          fetchExpenseAnalytics(),
          fetchMonthlyAnalytics(),
        ]);

      setSummary(summaryResult);
      setCategoryData(categoryResult);
      setMonthlyData(monthlyResult);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Unable to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const chartMonthlyData = monthlyData.map((item) => ({
    month: `${getMonthName(item.month)} ${String(item.year).slice(-2)}`,
    income: item.income,
    expenses: item.expense,
  }));

  const chartCategoryData = categoryData.map((item) => ({
    name: item.category,
    value: item.totalAmount,
  }));

  const totalCategoryExpense = categoryData.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const highestCategory = categoryData.length
    ? [...categoryData].sort(
        (a, b) => b.totalAmount - a.totalAmount
      )[0]
    : null;

  const savingsRate =
    summary && summary.totalIncome > 0
      ? ((summary.totalIncome - summary.totalExpense) /
          summary.totalIncome) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Topbar search={search} onSearchChange={setSearch} />

        <div className="space-y-6 p-5 md:p-8">
          {/* Header */}
          <section>
            <p className="text-sm text-slate-500">
              Financial Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Understand your income, expenses and spending patterns.
            </p>
          </section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Loading financial analytics...
            </div>
          ) : summary ? (
            <>
              {/* Summary Cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Income"
                  value={formatCurrency(summary.totalIncome)}
                  icon={TrendingUp}
                  color="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  title="Total Expenses"
                  value={formatCurrency(summary.totalExpense)}
                  icon={TrendingDown}
                  color="bg-red-50 text-red-600"
                />

                <StatCard
                  title="Current Balance"
                  value={formatCurrency(summary.currentBalance)}
                  icon={Wallet}
                  color="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="Savings Rate"
                  value={`${savingsRate.toFixed(1)}%`}
                  icon={PiggyBank}
                  color="bg-violet-50 text-violet-600"
                />
              </section>

              {/* Monthly Chart */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <BarChart3 size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Income vs Expenses
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Monthly financial activity over the last six months.
                    </p>
                  </div>
                </div>

                <div className="mt-6 h-80">
                  {chartMonthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartMonthlyData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis dataKey="month" />

                        <YAxis
                          tickFormatter={(value) =>
                            formatCurrency(Number(value))
                          }
                        />

                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />

                        <Legend />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />

                        <Bar
                          dataKey="expenses"
                          name="Expenses"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No monthly data available.
                    </div>
                  )}
                </div>
              </section>

              {/* Category Analytics */}
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                      <PieChartIcon size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-800">
                        Spending by Category
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Expense distribution across categories.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-72">
                    {chartCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartCategoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={3}
                          >
                            {chartCategoryData.map((item, index) => (
                              <Cell
                                key={item.name}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No expense data available.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Total Categorized Expenses
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(totalCategoryExpense)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-800">
                    Category Breakdown
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Detailed expense distribution.
                  </p>

                  {categoryData.length > 0 ? (
                    <div className="mt-5 space-y-5">
                      {categoryData.map((item) => {
                        const percentage =
                          totalCategoryExpense > 0
                            ? (item.totalAmount / totalCategoryExpense) * 100
                            : 0;

                        return (
                          <div key={item.category}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {item.category}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {item.transactionCount} transactions
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(item.totalAmount)}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-sm text-slate-400">
                      No category data available.
                    </div>
                  )}
                </div>
              </section>

              {/* Spending Insight */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-800">
                  Spending Insights
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  A quick overview of your financial activity.
                </p>

                <div className="mt-4 space-y-3">
                  {highestCategory ? (
                    <div className="rounded-lg bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-800">
                        Highest spending category
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        {highestCategory.category} accounts for{" "}
                        {formatCurrency(highestCategory.totalAmount)} of your expenses.
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                      Add some expense transactions to discover your spending patterns.
                    </p>
                  )}

                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-800">
                      Financial balance
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      {summary.currentBalance >= 0
                        ? "Your total income is currently greater than or equal to your expenses."
                        : "Your total expenses currently exceed your income."}
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
