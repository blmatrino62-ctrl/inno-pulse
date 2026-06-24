import { useState } from "react";

import { useReactions } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import { QueryError } from "./ErrorBoundary";
import { TableSkeleton } from "./ui/Skeleton";

const PAGE_SIZE = 50;

const SEV_CLASS: Record<string, string> = {
  mild: "text-green-600 dark:text-green-400",
  moderate: "text-yellow-600 dark:text-yellow-400",
  severe: "text-orange-500",
  extreme: "text-red-500",
  lethal: "text-red-800 dark:text-red-400 font-bold",
  unk: "text-gray-400",
};

export function SignalTable() {
  const { filters } = useFilters();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useReactions(
    filters,
    page,
    PAGE_SIZE,
  );

  if (isError)
    return (
      <QueryError message={(error as Error).message} onRetry={() => refetch()} />
    );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h2 className="font-semibold">Adverse-event reactions</h2>
        <span className="muted text-xs">
          {data?.total.toLocaleString() ?? 0} matching · row = AE from v_ae_flat
        </span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr className="muted text-left text-xs uppercase tracking-wide">
                <th className="w-36 px-3 py-2">INN (ingredient)</th>
                <th className="w-56 px-3 py-2">Reaction (raw)</th>
                <th className="w-44 px-3 py-2">MedDRA PT</th>
                <th className="w-40 px-3 py-2">SOC</th>
                <th className="w-24 px-3 py-2">Severity</th>
                <th className="w-16 px-3 py-2">Serious</th>
                <th className="w-24 px-3 py-2">Source ▲</th>
                <th className="w-24 px-3 py-2">Date ▲</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr
                  key={`${r.id}-${r.reaction}`}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-2)]"
                >
                  <td className="px-3 py-2 font-medium capitalize">
                    {r.drug_ingredient ?? "—"}
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-2" title={r.reaction ?? ""}>
                    {r.reaction ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{r.meddra_pt ?? "—"}</td>
                  <td className="muted max-w-[160px] truncate px-3 py-2 text-xs">
                    {r.meddra_soc ?? "—"}
                  </td>
                  <td className={`px-3 py-2 text-xs capitalize ${SEV_CLASS[r.severity ?? "unk"] ?? ""}`}>
                    {r.severity ?? "unk"}
                  </td>
                  <td className="px-3 py-2">
                    {r.is_serious === "Yes" ? (
                      <span className="text-amber-500">⚠</span>
                    ) : (
                      <span className="muted text-xs">—</span>
                    )}
                  </td>
                  <td className="muted px-3 py-2 text-xs">{r.source}</td>
                  <td className="muted whitespace-nowrap px-3 py-2 text-xs">
                    {r.published_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-4 py-2 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded border border-[var(--border)] px-2 py-1 disabled:opacity-40"
        >
          ‹ Prev
        </button>
        <span className="muted">
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded border border-[var(--border)] px-2 py-1 disabled:opacity-40"
        >
          Next ›
        </button>
      </div>
    </section>
  );
}
