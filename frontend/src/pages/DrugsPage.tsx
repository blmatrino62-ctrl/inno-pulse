import { useNavigate } from "react-router-dom";

import { useIngredients } from "@/api/hooks";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";

export function DrugsPage() {
  const { data, isLoading } = useIngredients();
  const navigate = useNavigate();

  const handleClick = (name: string) => {
    navigate(`/reactions?drug_ingredient=${encodeURIComponent(name)}`);
  };

  // Group alphabetically by first letter
  const grouped = (data ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce<Record<string, typeof data>>((acc, ing) => {
      const letter = ing.name[0]?.toUpperCase() ?? "#";
      if (!acc[letter]) acc[letter] = [];
      acc[letter]!.push(ing);
      return acc;
    }, {});

  return (
    <ErrorBoundary>
      <div className="mb-4 flex items-baseline gap-3">
        <h1 className="text-lg font-semibold">Drugs — INN</h1>
        {data && (
          <span className="muted text-sm">{data.length} ingredients</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="card p-3">
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([letter, ings]) => (
              <div key={letter}>
                <h2
                  className="mb-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--accent)" }}
                >
                  {letter}
                </h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                  {ings?.map((ing) => (
                    <button
                      key={ing.name}
                      onClick={() => handleClick(ing.name)}
                      className="card p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      <div className="truncate font-medium text-sm capitalize">
                        {ing.name}
                      </div>
                      <div className="muted mt-1 text-[10px]">
                        {ing.post_count} posts · {ing.reaction_count} AE
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </ErrorBoundary>
  );
}
