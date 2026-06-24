import { useKpi } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import type { Delta } from "@/types";
import { QueryError } from "./ErrorBoundary";
import { Skeleton } from "./ui/Skeleton";

function DeltaTag({
  delta,
  invert = false,
  suffix = "%",
}: {
  delta: Delta;
  invert?: boolean;
  suffix?: string;
}) {
  if (delta.direction === "flat") return <span className="muted text-xs">—</span>;
  const up = delta.direction === "up";
  const positive = invert ? !up : up;
  const color = positive ? "text-green-500" : "text-red-500";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {up ? "+" : "−"}
      {delta.value}
      {suffix}
    </span>
  );
}

export function KpiCards() {
  const { filters } = useFilters();
  const { data, isLoading, isError, error, refetch } = useKpi(filters);

  if (isError)
    return (
      <QueryError message={(error as Error).message} onRetry={() => refetch()} />
    );

  if (isLoading || !data)
    return (
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
      {/* 1 — AE rows */}
      <div className="card p-4">
        <div className="muted mb-1 text-xs font-medium uppercase tracking-wide">
          Adverse-event rows
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {(data.ae_rows / 1000).toFixed(1)}k
          </span>
          <DeltaTag delta={data.ae_rows_delta} />
        </div>
        <div className="muted mt-0.5 text-[10px]">v_ae_flat · reaction rows</div>
      </div>

      {/* 2 — Unique posts */}
      <div className="card p-4">
        <div className="muted mb-1 text-xs font-medium uppercase tracking-wide">
          Unique posts
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {(data.unique_posts / 1000).toFixed(1)}k
          </span>
          <span className="muted text-xs">{data.reactions_per_post}/post</span>
        </div>
        <div className="muted mt-0.5 text-[10px]">distinct post id</div>
      </div>

      {/* 3 — Serious reactions */}
      <div className="card p-4">
        <div className="muted mb-1 text-xs font-medium uppercase tracking-wide">
          Serious reactions
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.serious_pct}%</span>
          <DeltaTag delta={data.serious_pct_delta} invert suffix="pp" />
        </div>
        <div className="muted mt-0.5 text-[10px]">is_serious = Yes</div>
      </div>

      {/* 4 — INN / brands */}
      <div className="card p-4">
        <div className="muted mb-1 text-xs font-medium uppercase tracking-wide">
          INN / brands
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.unique_ingredients}</span>
          <span className="muted text-xs">{data.unique_brands} brands</span>
        </div>
        <div className="muted mt-0.5 text-[10px]">drug_ingredient</div>
      </div>

      {/* 5 — MedDRA coverage */}
      <div className="card p-4">
        <div className="muted mb-1 text-xs font-medium uppercase tracking-wide">
          MedDRA coverage
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{data.meddra_pt_count}</span>
          <span className="muted text-xs">PT</span>
        </div>
        <div className="muted mt-0.5 text-[10px]">
          {data.meddra_soc_count} SOC · meddra_soc/pt
        </div>
      </div>
    </div>
  );
}
