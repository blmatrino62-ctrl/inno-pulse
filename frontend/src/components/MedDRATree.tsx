import { useState } from "react";

import { useMedDRATree } from "@/api/hooks";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useFilters } from "@/hooks/useFilters";
import type { SocNode } from "@/types";

const SOC_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#6366F1",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#A855F7",
  "#0EA5E9",
  "#D946EF",
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

interface Props {
  selectedPt: string | null;
  onSelectPt: (pt: string | null) => void;
}

export function MedDRATree({ selectedPt, onSelectPt }: Props) {
  const { filters } = useFilters();
  const { data = [], isLoading } = useMedDRATree(filters);
  const [openSocs, setOpenSocs] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  const maxCount = Math.max(...data.map((s) => s.reaction_count), 1);

  const toggleSoc = (soc: string) => {
    setOpenSocs((prev) => {
      const next = new Set(prev);
      if (next.has(soc)) next.delete(soc);
      else next.add(soc);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (allExpanded) {
      setOpenSocs(new Set());
      setAllExpanded(false);
    } else {
      setOpenSocs(new Set(data.map((s) => s.soc)));
      setAllExpanded(true);
    }
  };

  const handlePtClick = (pt: string) => {
    onSelectPt(selectedPt === pt ? null : pt);
  };

  if (isLoading) return <TableSkeleton rows={10} />;
  if (!data.length)
    return (
      <div className="card p-8 text-center muted text-sm">No data</div>
    );

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div>
          <p className="font-semibold text-sm">Adverse reactions by system</p>
          <p className="text-xs muted">
            MedDRA SOC → PT · click a row to see posts
          </p>
        </div>
        <button
          onClick={handleExpandAll}
          className="text-xs font-medium"
          style={{ color: "var(--accent)" }}
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div>
        {data.map((soc: SocNode, idx: number) => {
          const color = SOC_COLORS[idx % SOC_COLORS.length];
          const isOpen = allExpanded || openSocs.has(soc.soc);
          const barPct = (soc.reaction_count / maxCount) * 100;

          return (
            <div
              key={soc.soc}
              className="border-b last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              {/* SOC row */}
              <button
                onClick={() => toggleSoc(soc.soc)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <span className="text-[10px] muted w-3 flex-shrink-0">
                  {isOpen ? "▾" : "▸"}
                </span>
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="font-medium text-sm flex-1 min-w-0 truncate">
                  {soc.soc}
                </span>
                <span
                  className="text-xs muted rounded-full border px-2 py-0.5 flex-shrink-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  {soc.pt_count} PT
                </span>
                <div className="w-32 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${barPct}%`, background: color }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-semibold tabular-nums flex-shrink-0">
                  {fmt(soc.reaction_count)}
                </span>
                <span
                  className={`w-14 text-right text-xs font-medium flex-shrink-0 ${
                    soc.serious_count > 0 ? "text-red-500" : "muted"
                  }`}
                >
                  {soc.serious_count > 0 ? `${soc.serious_count} ▲` : "—"}
                </span>
              </button>

              {/* PT rows */}
              {isOpen && (
                <div>
                  {soc.pts.map((pt) => {
                    const ptBarPct =
                      (pt.reaction_count / soc.reaction_count) * 100;
                    const isSelected = selectedPt === pt.pt;
                    return (
                      <button
                        key={pt.pt}
                        onClick={() => handlePtClick(pt.pt)}
                        className={`w-full flex items-center gap-3 pl-10 pr-4 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/40"
                            : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-sm flex-1 min-w-0 truncate">
                          {pt.pt}
                        </span>
                        <span
                          className="text-[10px] muted border rounded px-1.5 py-0.5 flex-shrink-0"
                          style={{ borderColor: "var(--border)" }}
                        >
                          PT
                        </span>
                        <div className="w-32 h-1 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${ptBarPct}%`,
                              background: color,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm tabular-nums flex-shrink-0">
                          {pt.reaction_count}
                        </span>
                        <span
                          className={`w-14 text-right text-xs flex-shrink-0 ${
                            pt.serious_count > 0 ? "text-red-500" : "muted"
                          }`}
                        >
                          {pt.serious_count > 0 ? `${pt.serious_count} ▲` : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
