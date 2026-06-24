import type { Filters } from "@/types";

const BASE = `${import.meta.env.BASE_URL}api`;

export function filtersToParams(
  f: Filters,
  extra: Record<string, string | number> = {},
): URLSearchParams {
  const p = new URLSearchParams();
  f.drug_ingredient.forEach((v) => p.append("drug_ingredient", v));
  f.drug_brand_name.forEach((v) => p.append("drug_brand_name", v));
  if (f.meddra_soc) p.set("meddra_soc", f.meddra_soc);
  if (f.meddra_pt) p.set("meddra_pt", f.meddra_pt);
  f.severity.forEach((v) => p.append("severity", v));
  if (f.is_serious !== null) p.set("is_serious", String(f.is_serious));
  if (f.language) p.set("language", f.language);
  if (f.source) p.set("source", f.source);
  if (f.drug_category) p.set("drug_category", f.drug_category);
  for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
  return p;
}

export async function apiGet<T>(
  path: string,
  params?: URLSearchParams,
): Promise<T> {
  const qs = params && [...params].length ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE}${path}${qs}`, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function exportCsvUrl(f: Filters): string {
  return `${BASE}/export/csv?${filtersToParams(f).toString()}`;
}
