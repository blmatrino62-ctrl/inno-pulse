import type { Severity } from "@/types";

const SEV_STYLE: Record<Severity, string> = {
  mild: "bg-green-500/15 text-green-600 dark:text-green-400",
  moderate: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  severe: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  extreme: "bg-red-500/15 text-red-600 dark:text-red-400",
  lethal: "bg-red-900/20 text-red-800 dark:text-red-300",
  unk: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
};

export function SeverityPill({ severity }: { severity: Severity | null }) {
  if (!severity)
    return <span className="muted text-xs">—</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEV_STYLE[severity]}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ isListed }: { isListed: boolean }) {
  return isListed ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
      ✅ Known
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
      🆕 Unlisted
    </span>
  );
}

export function TrendCell({ pct }: { pct: number }) {
  const up = pct > 0;
  const flat = pct === 0;
  const color = flat
    ? "muted"
    : up
      ? "text-red-500"
      : "text-green-500";
  const arrow = flat ? "→" : up ? "▲" : "▼";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {arrow} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}
