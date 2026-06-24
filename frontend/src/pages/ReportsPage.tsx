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

import { useTrends } from "@/api/hooks";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TableSkeleton } from "@/components/ui/Skeleton";

const SOURCE_COLOR: Record<string, string> = {
  "Twitter/X": "#1d9bf0",
  Reddit: "#ff4500",
  Facebook: "#1877f2",
};

export function ReportsPage() {
  const { data, isLoading } = useTrends();

  // Pivot: [{month, "Twitter/X": n, Reddit: n, Facebook: n}, ...]
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

  return (
    <ErrorBoundary>
      <h1 className="mb-4 text-lg font-semibold">Reports over time, by source</h1>
      <div className="card p-4">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
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
        )}
      </div>
    </ErrorBoundary>
  );
}
