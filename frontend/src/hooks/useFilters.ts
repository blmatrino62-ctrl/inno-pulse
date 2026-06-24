import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type { Filters } from "@/types";
import { EMPTY_FILTERS } from "@/types";

function parseBool(v: string | null): boolean | null {
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export function useFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<Filters>(
    () => ({
      drug_ingredient: params.getAll("drug_ingredient"),
      drug_brand_name: params.getAll("drug_brand_name"),
      meddra_soc: params.get("meddra_soc"),
      meddra_pt: params.get("meddra_pt"),
      severity: params.getAll("severity"),
      is_serious: parseBool(params.get("is_serious")),
      language: params.get("language"),
      source: params.get("source"),
      drug_category: params.get("drug_category"),
    }),
    [params],
  );

  const setFilters = useCallback(
    (next: Filters) => {
      const p = new URLSearchParams();
      next.drug_ingredient.forEach((v) => p.append("drug_ingredient", v));
      next.drug_brand_name.forEach((v) => p.append("drug_brand_name", v));
      if (next.meddra_soc) p.set("meddra_soc", next.meddra_soc);
      if (next.meddra_pt) p.set("meddra_pt", next.meddra_pt);
      next.severity.forEach((v) => p.append("severity", v));
      if (next.is_serious !== null) p.set("is_serious", String(next.is_serious));
      if (next.language) p.set("language", next.language);
      if (next.source) p.set("source", next.source);
      if (next.drug_category) p.set("drug_category", next.drug_category);
      setParams(p, { replace: true });
    },
    [setParams],
  );

  const patch = useCallback(
    (delta: Partial<Filters>) => setFilters({ ...filters, ...delta }),
    [filters, setFilters],
  );

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);

  return { filters, setFilters, patch, reset };
}
