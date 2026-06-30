import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function ExpandablePostText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const short = text.length > 160;
  return (
    <p className="text-xs muted leading-relaxed">
      {short && !expanded ? text.slice(0, 160) + "…" : text}
      {short && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="ml-1 font-medium"
          style={{ color: "var(--accent)" }}
        >
          {expanded ? "less" : "more"}
        </button>
      )}
    </p>
  );
}

import { apiGet, filtersToParams } from "@/api/client";
import { useFilters } from "@/hooks/useFilters";
import type { Page, PostRow } from "@/types";
import { isCritical } from "@/utils/criticalPts";

const SOURCE_ICON: Record<string, string> = {
  "Twitter/X": "𝕏",
  Reddit: "⬆",
  Facebook: "f",
};

function PostCard({ post }: { post: PostRow }) {
  const serious = post.is_serious === "Yes";
  const hasCriticalRxn = post.reactions.some((r) => isCritical(r));
  const alert = serious || hasCriticalRxn;
  return (
    <div
      className={`rounded-lg border p-3 space-y-1.5 ${alert ? "border-l-4 border-l-red-500" : ""}`}
      style={{
        borderColor: alert ? undefined : "var(--border)",
        background: alert ? "var(--surface-2)" : "var(--surface-2)",
        backgroundColor: alert ? "rgba(239,68,68,0.04)" : undefined,
      }}
    >
      <div className="flex items-center gap-2 text-xs muted flex-wrap">
        <span className="font-mono font-bold">
          {SOURCE_ICON[post.source] ?? post.source}
        </span>
        <span>{post.source}</span>
        <span>·</span>
        <span>{post.published_at.slice(0, 10)}</span>
        <span>·</span>
        <span className="uppercase">{post.language}</span>
        {serious && (
          <span className="ml-auto rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-red-600 dark:text-red-400 font-semibold">
            ⚠ SAE
          </span>
        )}
      </div>

      {post.drug_ingredient && (
        <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
          {post.drug_ingredient}
          {post.drug_brand_name ? ` · ${post.drug_brand_name}` : ""}
        </p>
      )}

      {post.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.reactions.slice(0, 4).map((r) => (
            <span
              key={r}
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                isCritical(r)
                  ? "border-red-300 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  : ""
              }`}
              style={isCritical(r) ? {} : { borderColor: "var(--border)" }}
            >
              {isCritical(r) && "⚠ "}{r}
            </span>
          ))}
          {post.reactions.length > 4 && (
            <span className="text-[11px] muted">
              +{post.reactions.length - 4}
            </span>
          )}
        </div>
      )}

      {post.text && <ExpandablePostText text={post.text} />}
    </div>
  );
}

interface Props {
  pt: string;
  onClose: () => void;
}

export function PostsSlidePanel({ pt, onClose }: Props) {
  const { filters } = useFilters();

  const { data, isLoading } = useQuery({
    queryKey: ["posts-by-pt", filters, pt],
    queryFn: () =>
      apiGet<Page<PostRow>>(
        "/reviews",
        filtersToParams({ ...filters, meddra_pt: pt }, { page: 1, page_size: 50 }),
      ),
    staleTime: 30_000,
  });

  const posts = data?.items ?? [];

  return (
    <div
      className="card flex flex-col h-full"
      style={{ maxHeight: "calc(100vh - 180px)", overflow: "hidden" }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="min-w-0">
          <p className="text-xs muted">MedDRA PT</p>
          <p className="font-semibold text-sm leading-snug mt-0.5 truncate">
            {pt}
          </p>
          {!isLoading && (
            <p className="text-xs muted mt-0.5">
              {data?.total ?? 0} posts found
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 h-6 w-6 rounded-lg grid place-items-center text-sm muted hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-lg" />
          ))
        ) : posts.length === 0 ? (
          <p className="text-center text-sm muted py-8">No posts found</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
