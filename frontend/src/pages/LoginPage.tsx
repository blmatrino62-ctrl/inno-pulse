import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const DEMO_USER = "demo";
const DEMO_PASS = "demo2024";
const AUTH_KEY = "inno-auth";

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated()) return <Navigate to="/reactions" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === DEMO_USER && pass === DEMO_PASS) {
      localStorage.setItem(AUTH_KEY, "true");
      navigate("/reactions", { replace: true });
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold text-white">
            ◈
          </span>
          <div>
            <div className="font-bold text-base">Inno-Pulse</div>
            <div className="muted text-xs uppercase tracking-wide">Pharmacovigilance</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium muted">Логин</label>
            <input
              autoFocus
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(""); }}
              placeholder="demo"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium muted">Пароль</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Войти
          </button>
        </form>

        <p className="muted mt-4 text-center text-xs">
          demo / demo2024
        </p>
      </div>
    </div>
  );
}
