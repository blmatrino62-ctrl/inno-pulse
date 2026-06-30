import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "@/pages/LoginPage";
import { useTheme } from "@/hooks/useTheme";

const TABS = [
  { to: "/reactions", label: "Reactions" },
  { to: "/reviews", label: "Reviews" },
  { to: "/drugs", label: "Drugs" },
  { to: "/notifications", label: "🔔 Alerts" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-20 flex h-14 items-center gap-6 px-4"
        style={{ background: "var(--topbar)", color: "var(--topbar-text)" }}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500 text-base font-bold">
            ◈
          </span>
          <div className="leading-tight">
            <div className="font-semibold">Inno-Pulse</div>
            <div className="text-[10px] uppercase tracking-wide opacity-60">
              Pharmacovigilance
            </div>
          </div>
          <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium">
            MedDRA
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden md:block">
            <input
              placeholder="Search ingredient, brand, MedDRA term…"
              className="w-64 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:bg-white/15"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-white/20 px-1 text-[10px] opacity-60">
              ⌘K
            </kbd>
          </div>
          <button
            onClick={toggle}
            title="Toggle dark mode"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            onClick={handleLogout}
            title="Выйти"
            className="grid h-8 w-8 place-items-center rounded-full bg-blue-500 text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            IP
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4">
        {children}
      </main>
    </div>
  );
}
