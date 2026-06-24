import { useSources } from "@/api/hooks";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";

const SOURCE_ICON: Record<string, string> = {
  "Twitter/X": "𝕏",
  Reddit: "🔴",
  Facebook: "🔵",
};

export function SourcesPage() {
  const { data, isLoading } = useSources();
  const total = data?.reduce((s, r) => s + r.reaction_count, 0) ?? 0;

  return (
    <ErrorBoundary>
      <h1 className="mb-4 text-lg font-semibold">Sources — social media</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6">
                <Skeleton className="mb-3 h-8 w-8" />
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))
          : data?.map((s) => (
              <div key={s.name} className="card p-6">
                <div className="mb-2 text-3xl">
                  {SOURCE_ICON[s.name] ?? "📡"}
                </div>
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="muted mt-1 text-sm">
                  {s.reaction_count.toLocaleString()} reactions ·{" "}
                  {s.post_count.toLocaleString()} posts
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(s.reaction_count / total) * 100}%` }}
                  />
                </div>
                <div className="muted mt-1 text-xs">
                  {total ? Math.round((s.reaction_count / total) * 100) : 0}% of
                  all reactions
                </div>
              </div>
            ))}
      </div>
    </ErrorBoundary>
  );
}
