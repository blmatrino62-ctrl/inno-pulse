import { useAnomalies } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";

const WINDOW_DAYS = 30;

function fmtDate(d: string) {
  return d ? d.slice(0, 10) : "—";
}

export function BaselineBanner() {
  const { filters } = useFilters();
  const { data, isLoading } = useAnomalies(filters, WINDOW_DAYS);

  if (isLoading || !data || data.baseline.mentions === 0) return null;

  const { baseline, recent, overall_pct_change, overall_is_spike, top_spikes } = data;
  const changeLabel =
    overall_pct_change === null
      ? "n/a"
      : `${overall_pct_change > 0 ? "+" : ""}${overall_pct_change}%`;

  return (
    <div
      className={`mb-4 rounded-xl border-2 px-4 py-3 ${
        overall_is_spike
          ? "border-red-300 bg-red-50 dark:bg-red-950/20"
          : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
        <span className={`font-semibold ${overall_is_spike ? "text-red-600" : "text-blue-600"}`}>
          {overall_is_spike ? "⚠ Signal detected" : "📊 Baseline reference"}
        </span>
        <span className="muted">
          Baseline: <b className="text-[var(--text)]">{fmtDate(baseline.date_from)} → {fmtDate(baseline.date_to)}</b>
          {" "}({baseline.mentions.toLocaleString()} mentions · {baseline.rate_per_day}/day)
        </span>
        <span className="muted">
          Recent {recent.days}d: <b className="text-[var(--text)]">{recent.mentions.toLocaleString()} mentions</b>
          {" "}({recent.rate_per_day}/day)
        </span>
        <span className={`font-semibold ${overall_is_spike ? "text-red-600" : overall_pct_change !== null && overall_pct_change < 0 ? "text-emerald-600" : "muted"}`}>
          {changeLabel} vs baseline
        </span>
        {top_spikes.length > 0 && (
          <span className="muted">
            Top rising:{" "}
            {top_spikes.slice(0, 3).map((s, i) => (
              <span key={s.pt}>
                {i > 0 && ", "}
                <b className="text-red-500">{s.pt}</b> (+{s.pct_change}%)
              </span>
            ))}
          </span>
        )}
      </div>
      <p className="muted mt-1 text-[10px] leading-snug">
        This dashboard's dataset serves as the historical baseline. As new mentions arrive, they're compared against it here to surface emerging signals.
      </p>
    </div>
  );
}
