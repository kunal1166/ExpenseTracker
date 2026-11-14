
import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Tags,
  Settings,
  Wallet,
  WalletCards,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/transactions" },
  { label: "Analytics", icon: ChartNoAxesCombined, to: "/analytics" },
  { label: "Budgets", icon: WalletCards, to: "/budgets" },
  { label: "Categories", icon: Tags, to: "/categories" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 text-white md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <Wallet size={23} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">
            ExpenseTracker
          </h1>
          <p className="text-xs text-slate-400">
            Personal Finance
          </p>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Workspace
      </p>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          const linkClass =
            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors";

          if (item.to) {
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `${linkClass} ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href}
              className={`${linkClass} text-slate-300 hover:bg-slate-800 hover:text-white`}
            >
              <Icon size={19} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-700 pt-5">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={19} />
          Logout
        </button>

        <p className="mt-4 px-3 text-xs text-slate-500">
          ExpenseTracker v1.0
        </p>
      </div>
    </aside>
  );
}
