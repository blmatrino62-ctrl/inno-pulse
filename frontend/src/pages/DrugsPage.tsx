import { useIngredients } from "@/api/hooks";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";

const CATEGORY_LABEL: Record<string, string> = {
  mood: "Mood / Psychiatry",
  adhd: "ADHD",
  anxiety: "Anxiety",
  gi: "Gastrointestinal",
  immune: "Immune",
  infective: "Infective",
  neuro: "Neurology",
  diabetes: "Diabetes",
  hormonal: "Hormonal",
  respiratory: "Respiratory",
  pain: "Pain",
  bone: "Bone",
  other: "Other",
};

export function DrugsPage() {
  const { data, isLoading } = useIngredients();

  // Group by drug_category
  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, ing) => {
    const cat = ing.drug_category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(ing);
    return acc;
  }, {});

  return (
    <ErrorBoundary>
      <div className="mb-4 flex items-baseline gap-3">
        <h1 className="text-lg font-semibold">Drugs — INN → reactions</h1>
        {data && (
          <span className="muted text-sm">
            {data.length} ingredients · {Object.keys(grouped).length} categories
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([, a], [, b]) => (b?.length ?? 0) - (a?.length ?? 0))
            .map(([cat, ings]) => (
              <div key={cat}>
                <h2 className="muted mb-2 text-xs font-semibold uppercase tracking-wide">
                  {CATEGORY_LABEL[cat] ?? cat} ({ings?.length ?? 0})
                </h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                  {ings?.map((ing) => (
                    <div
                      key={ing.name}
                      className="card p-3"
                    >
                      <div className="truncate font-medium capitalize text-sm">
                        {ing.name}
                      </div>
                      <div className="muted mt-1 text-[10px]">
                        {ing.post_count} posts · {ing.reaction_count} AE
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </ErrorBoundary>
  );
}
