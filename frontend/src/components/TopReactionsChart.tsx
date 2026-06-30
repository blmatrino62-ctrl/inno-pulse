import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTopReactions } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import { Skeleton } from "./ui/Skeleton";

export function TopReactionsChart() {
  const { filters } = useFilters();
  const { data, isLoading } = useTopReactions(filters);

  if (isLoading)
    return (
      <div className="card p-4">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-52 w-full" />
      </div>
    );

  if (!data?.length) return null;

  return (
    <div className="card p-4">
      <p className="mb-3 font-semibold text-sm">Top reactions (MedDRA PT)</p>
      <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <XAxis
            type="number"
            stroke="var(--text-muted)"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="pt"
            width={130}
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [v, "reactions"]}
          />
          <Bar dataKey="reaction_count" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={`hsl(${210 + i * 8}, 80%, ${58 - i * 3}%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
