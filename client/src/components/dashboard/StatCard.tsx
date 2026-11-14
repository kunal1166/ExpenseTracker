import {
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { usePreferences } from "../../context/PreferencesContext";

interface StatCardProps {
  title: string;
  amount: number;
  description: string;
  type: "balance" | "income" | "expense";
}

const config = {
  balance: {
    icon: Wallet,
    color: "bg-blue-50 text-blue-600",
  },
  income: {
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
  },
  expense: {
    icon: TrendingDown,
    color: "bg-red-50 text-red-600",
  },
};

export default function StatCard({
  title,
  amount,
  description,
  type,
}: StatCardProps) {
  const Icon = config[type].icon;
  const { formatCurrency } = usePreferences();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className={`rounded-lg p-2 ${config[type].color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {formatCurrency(amount)}
      </h2>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}
