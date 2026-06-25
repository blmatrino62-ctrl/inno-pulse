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

const SOURCE_ICON: Record<string, string> = {
  "Twitter/X": "𝕏",
  Reddit: "⬆",
  Facebook: "f",
};

function PostCard({ post }: { post: PostRow }) {
  return (
    <div
      className="rounded-lg border p-3 space-y-1.5"
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      <div className="flex items-center gap-2 text-xs muted">
        <span className="font-mono font-bold">
          {SOURCE_ICON[post.source] ?? post.source}
        </span>
        <span>{post.source}</span>
        <span>·</span>
        <span>{post.published_at.slice(0, 10)}</span>
        <span>·</span>
        <span className="uppercase">{post.language}</span>
        {post.is_serious === "Yes" && (
          <span className="ml-auto rounded-full bg-red-500/10 px-2 py-0.5 text-red-500 font-medium">
            ⚠ Serious
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
              className="rounded-full border px-2 py-0.5 text-[11px]"
              style={{ borderColor: "var(--border)" }}
            >
              {r}
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
