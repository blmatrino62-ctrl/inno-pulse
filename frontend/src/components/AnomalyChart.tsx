import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAnomalies } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import type { PtAnomaly } from "@/types";
import { Skeleton } from "./ui/Skeleton";

const WINDOW_DAYS = 30;
const THRESHOLD_PCT = 50;

function truncate(s: string, n = 12) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// Red dot on the recent-rate line wherever that reaction is a spike.
function SpikeDot(props: {
  cx?: number;
  cy?: number;
  payload?: PtAnomaly;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return <g />;
  if (payload.is_spike) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={11} fill="none" stroke="#ef4444" strokeOpacity={0.35} strokeWidth={2} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="var(--accent)" />;
}

function AnomalyTooltip({ active, payload }: { active?: boolean; payload?: { payload: PtAnomaly }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p className="font-semibold mb-1">{d.pt}</p>
      <p className="muted">Baseline: {d.baseline_rate}/day ({d.baseline_count} total)</p>
      <p className="muted">Recent: {d.recent_rate}/day ({d.recent_count} total)</p>
      <p className={d.is_spike ? "text-red-500 font-semibold mt-0.5" : "muted mt-0.5"}>
        {d.pct_change === null ? "n/a" : `${d.pct_change > 0 ? "+" : ""}${d.pct_change}%`}
        {d.is_spike ? " ⚠ spike" : ""}
      </p>
    </div>
  );
}

export function AnomalyChart() {
  const { filters } = useFilters();
  const { data, isLoading } = useAnomalies(filters, WINDOW_DAYS, THRESHOLD_PCT);

  if (isLoading)
    return (
      <div className="card p-4">
        <Skeleton className="mb-3 h-4 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (!data || data.series.length === 0) return null;

  const spikeCount = data.series.filter((s) => s.is_spike).length;

  return (
    <div className="card p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="font-semibold text-sm">Baseline vs recent activity</p>
        <span className="text-xs muted">
          bars = baseline avg/day · line = last {data.recent.days}d/day
        </span>
      </div>
      <p className="muted mb-3 text-xs">
        {spikeCount > 0 ? (
          <span className="text-red-500 font-medium">
            ⚠ {spikeCount} reaction{spikeCount > 1 ? "s" : ""} spiking above baseline
          </span>
        ) : (
          "No reactions above the spike threshold in the recent window."
        )}
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data.series} margin={{ top: 8, right: 12, left: 0, bottom: 44 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="pt"
            tickFormatter={(v: string) => truncate(v)}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={44}
            stroke="var(--text-muted)"
            tick={{ fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "mentions / day",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "var(--text-muted)" },
            }}
          />
          <Tooltip content={<AnomalyTooltip />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="baseline_rate" name="Baseline avg/day" radius={[3, 3, 0, 0]} maxBarSize={34}>
            {data.series.map((s, i) => (
              <Cell key={i} fill={s.is_spike ? "#fca5a5" : "var(--accent)"} fillOpacity={0.55} />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="recent_rate"
            name="Recent/day"
            stroke="#ef4444"
            strokeWidth={2}
            dot={<SpikeDot />}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
