import { useState } from "react";

import { usePosts } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import { QueryError } from "./ErrorBoundary";
import { TableSkeleton } from "./ui/Skeleton";

const PAGE_SIZE = 50;

export function ReviewsTab() {
  const { filters } = useFilters();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePosts(
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
        <h2 className="font-semibold">Social-media posts</h2>
        <span className="muted text-xs">{data?.total.toLocaleString() ?? 0} unique posts</span>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr className="muted text-left text-xs uppercase tracking-wide">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">INN</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Lang</th>
                <th className="px-3 py-2">Serious</th>
                <th className="px-3 py-2">Reactions</th>
                <th className="px-3 py-2">Post excerpt</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface-2)]"
                >
                  <td className="whitespace-nowrap px-3 py-2">{r.published_at}</td>
                  <td className="px-3 py-2 capitalize">{r.drug_ingredient ?? "—"}</td>
                  <td className="px-3 py-2">{r.drug_brand_name ?? "—"}</td>
                  <td className="px-3 py-2">{r.source}</td>
                  <td className="px-3 py-2 uppercase">{r.language}</td>
                  <td className="px-3 py-2">
                    {r.is_serious === "Yes" ? (
                      <span className="text-amber-500">⚠ Yes</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="max-w-[180px] px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.reactions.slice(0, 3).map((rxn, i) => (
                        <span
                          key={i}
                          className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px]"
                        >
                          {rxn}
                        </span>
                      ))}
                      {r.reactions.length > 3 && (
                        <span className="muted text-[10px]">
                          +{r.reactions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="muted max-w-[280px] truncate px-3 py-2">
                    {r.text}
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
