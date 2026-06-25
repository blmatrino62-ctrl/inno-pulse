import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSources, useTrends } from "@/api/hooks";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FilterPanel } from "@/components/FilterPanel";
import { ReviewsTab } from "@/components/ReviewsTab";
import { Skeleton } from "@/components/ui/Skeleton";

const SOURCE_ICON: Record<string, string> = {
  "Twitter/X": "𝕏",
  Reddit: "🔴",
  Facebook: "🔵",
};

const SOURCE_COLOR: Record<string, string> = {
  "Twitter/X": "#1d9bf0",
  Reddit: "#ff4500",
  Facebook: "#1877f2",
};

function SourceBins() {
  const { data, isLoading } = useSources();
  const total = data?.reduce((s, r) => s + r.reaction_count, 0) ?? 0;

  if (isLoading)
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="mb-2 h-6 w-6" />
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {data?.map((s) => (
        <div key={s.name} className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{SOURCE_ICON[s.name] ?? "📡"}</span>
            <span className="font-semibold text-sm">{s.name}</span>
          </div>
          <div className="muted text-xs">
            {s.reaction_count.toLocaleString()} reactions · {s.post_count.toLocaleString()} posts
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${total ? (s.reaction_count / total) * 100 : 0}%`,
                background: SOURCE_COLOR[s.name] ?? "#64748b",
              }}
            />
          </div>
          <div className="muted mt-1 text-[11px]">
            {total ? Math.round((s.reaction_count / total) * 100) : 0}% of reactions
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendsChart() {
  const { data, isLoading } = useTrends();

  const months = [...new Set((data ?? []).map((d) => d.month))].sort();
  const sources = [...new Set((data ?? []).map((d) => d.source))];

  const chartData = months.map((m) => {
    const row: Record<string, string | number> = { month: m };
    for (const s of sources) {
      const pt = data?.find((d) => d.month === m && d.source === s);
      row[s] = pt?.count ?? 0;
    }
    return row;
  });

  if (isLoading) return <Skeleton className="h-52 w-full rounded-xl" />;

  return (
    <div className="card p-4">
      <p className="font-semibold text-sm mb-3">Mentions over time</p>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} width={32} />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {sources.map((s) => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={SOURCE_COLOR[s] ?? "#64748b"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReviewsPage() {
  return (
    <ErrorBoundary>
      <FilterPanel />
      <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: "280px 1fr" }}>
        <SourceBins />
        <TrendsChart />
      </div>
      <div className="mt-4">
        <ReviewsTab />
      </div>
    </ErrorBoundary>
  );
}
