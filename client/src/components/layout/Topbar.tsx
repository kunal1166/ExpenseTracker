import { Bell, Search, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Topbar({
  search,
  onSearchChange,
}: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div className="relative w-full max-w-md">
        <Search
          size={19}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search transactions..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <UserCircle size={36} className="text-slate-500" />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email || "Personal Account"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}