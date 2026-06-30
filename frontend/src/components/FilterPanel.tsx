import { useState } from "react";

import { useBrands, useIngredients, useSources } from "@/api/hooks";
import { useFilters } from "@/hooks/useFilters";
import { ExportButton } from "./ExportButton";

const LANGS = ["en", "ru", "de"];
const SEVERITIES = ["mild", "moderate", "severe", "extreme", "lethal", "unk"];

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300"
          : "border-[var(--border)] hover:bg-[var(--surface-2)]"
      }`}
      style={!active ? { color: "var(--text-muted)" } : undefined}
    >
      {children}
    </button>
  );
}

export function FilterPanel() {
  const { filters, patch, reset } = useFilters();
  const { data: ingredients } = useIngredients();
  const { data: brands } = useBrands();
  const { data: sources } = useSources();
  const [ingSearch, setIngSearch] = useState("");
  const [ingOpen, setIngOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);

  const filteredIngs = (
    ingSearch
      ? ingredients?.filter((i) =>
          i.name.toLowerCase().includes(ingSearch.toLowerCase()),
        )
      : ingredients?.slice().sort((a, b) => b.post_count - a.post_count)
  )?.filter((i) => !filters.drug_ingredient.includes(i.name));

  const filteredBrands = (
    brandSearch
      ? brands?.filter((b) =>
          b.name.toLowerCase().includes(brandSearch.toLowerCase()),
        )
      : brands
  )?.filter((b) => !filters.drug_brand_name.includes(b.name));

  const toggleArr = <K extends "drug_ingredient" | "drug_brand_name" | "severity">(
    key: K,
    val: string,
  ) => {
    const arr = filters[key] as string[];
    patch({ [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };

  const sourceNames = sources?.map((s) => s.name) ?? [
    "Twitter/X",
    "Reddit",
    "Facebook",
  ];

  return (
    <div className="card mb-4 space-y-3 p-3">
      {/* Row 1 — ingredient + brand + is_serious + export */}
      <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
        {/* Ingredient multiselect */}
        <div className="flex items-start gap-2">
          <span className="muted mt-1.5 text-xs font-semibold uppercase">
            Ingredient
          </span>
          <div className="relative">
            <input
              value={ingSearch}
              onChange={(e) => setIngSearch(e.target.value)}
              onFocus={() => setIngOpen(true)}
              onBlur={() => setTimeout(() => setIngOpen(false), 150)}
              placeholder={`Search (${ingredients?.length ?? "…"})`}
              className="w-52 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
            />
            {ingOpen && filteredIngs && filteredIngs.length > 0 && (
              <div className="absolute z-30 mt-0.5 max-h-56 w-full overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                {filteredIngs.slice(0, 40).map((i) => (
                  <button
                    key={i.name}
                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-[var(--surface-2)]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      toggleArr("drug_ingredient", i.name);
                      setIngSearch("");
                    }}
                  >
                    <span className="font-medium">{i.name}</span>
                    <span className="muted ml-1">({i.post_count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.drug_ingredient.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-300"
              >
                {v}
                <button onClick={() => toggleArr("drug_ingredient", v)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Brand multiselect */}
        <div className="flex items-start gap-2">
          <span className="muted mt-1.5 text-xs font-semibold uppercase">Brand</span>
          <div className="relative">
            <input
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              onFocus={() => setBrandOpen(true)}
              onBlur={() => setTimeout(() => setBrandOpen(false), 150)}
              placeholder={`Search (${brands?.length ?? "…"})`}
              className="w-44 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
            />
            {brandOpen && filteredBrands && filteredBrands.length > 0 && (
              <div className="absolute z-30 mt-0.5 max-h-56 w-full overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                {filteredBrands.slice(0, 40).map((b) => (
                  <button
                    key={b.name}
                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-[var(--surface-2)]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      toggleArr("drug_brand_name", b.name);
                      setBrandSearch("");
                    }}
                  >
                    <span className="font-medium">{b.name}</span>
                    <span className="muted ml-1">({b.post_count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.drug_brand_name.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-600 dark:text-violet-300"
              >
                {v}
                <button onClick={() => toggleArr("drug_brand_name", v)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* is_serious */}
        <div className="flex items-center gap-1">
          <span className="muted text-xs font-semibold uppercase">Serious</span>
          <Toggle
            active={filters.is_serious === null}
            onClick={() => patch({ is_serious: null })}
          >
            All
          </Toggle>
          <Toggle
            active={filters.is_serious === true}
            onClick={() => patch({ is_serious: true })}
          >
            ⚠ Yes
          </Toggle>
        </div>

        {/* Source */}
        <div className="flex items-center gap-1">
          <span className="muted text-xs font-semibold uppercase">Source</span>
          <Toggle
            active={filters.source === null}
            onClick={() => patch({ source: null })}
          >
            All
          </Toggle>
          {sourceNames.map((s) => (
            <Toggle
              key={s}
              active={filters.source === s}
              onClick={() => patch({ source: filters.source === s ? null : s })}
            >
              {s}
            </Toggle>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={reset}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium hover:bg-[var(--surface-2)]"
            style={{ color: "var(--text-muted)" }}
          >
            Reset
          </button>
          <ExportButton filters={filters} />
        </div>
      </div>

      {/* Row 2 — severity + language */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-1">
          <span className="muted text-xs font-semibold uppercase">Severity</span>
          <Toggle
            active={filters.severity.length === 0}
            onClick={() => patch({ severity: [] })}
          >
            All
          </Toggle>
          {SEVERITIES.map((s) => (
            <Toggle
              key={s}
              active={filters.severity.includes(s)}
              onClick={() => toggleArr("severity", s)}
            >
              {s}
            </Toggle>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="muted text-xs font-semibold uppercase">Lang</span>
          <Toggle
            active={filters.language === null}
            onClick={() => patch({ language: null })}
          >
            All
          </Toggle>
          {LANGS.map((l) => (
            <Toggle
              key={l}
              active={filters.language === l}
              onClick={() => patch({ language: filters.language === l ? null : l })}
            >
              {l.toUpperCase()}
            </Toggle>
          ))}
        </div>
      </div>
    </div>
  );
}
