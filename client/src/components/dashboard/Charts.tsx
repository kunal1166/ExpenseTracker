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

import { usePreferences } from "../../context/PreferencesContext";

interface ChartsProps {
  transactions: {
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
  }[];
}

export default function Charts({ transactions }: ChartsProps) {
  const { formatCurrency, currency } = usePreferences();

  // Generate the last six months without date rollover
  const today = new Date();

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (5 - index),
      1
    );

    const month = date.toLocaleString("en-US", {
      month: "short",
    });

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const monthlyTransactions = transactions.filter((item) =>
      item.date.slice(0, 10).startsWith(monthKey)
    );

    return {
      month,
      income: monthlyTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),

      expenses: monthlyTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });

  // Calculate category-wise expenses
  const categoryMap = transactions
    .filter((item) => item.type === "expense")
    .reduce<Record<string, number>>((acc, item) => {
      acc[item.category] =
        (acc[item.category] || 0) + item.amount;

      return acc;
    }, {});

  const categoryData = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const COLORS = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#64748b",
  ];

  // Compact axis labels using the selected currency's symbol
  const formatAxisCurrency = (value: number) => {
    const formatted = formatCurrency(value);
    return value >= 1000
      ? `${formatted.replace(/[\d.,\s]/g, "")}${(value / 1000).toFixed(0)}k`
      : formatted;
  };

  return (
    <div
      id="analytics"
      className="grid grid-cols-1 gap-5 xl:grid-cols-2"
    >
      {/* Monthly Income vs Expenses */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800">
          Income vs Expenses
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Financial activity over the last six months
        </p>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="month" />

              <YAxis
                tickFormatter={(value) => formatAxisCurrency(Number(value))}
              />

              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value))
                }
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
        </div>
      </section>

      {/* Category-wise Expenses */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800">
          Spending by Category
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Expense distribution across categories ({currency})
        </p>

        <div className="mt-6 h-72">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {categoryData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value))
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No expense data available
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
