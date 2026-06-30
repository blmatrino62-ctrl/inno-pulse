export type Severity = "mild" | "moderate" | "severe" | "extreme" | "lethal" | "unk";

export interface Delta {
  value: number;
  direction: "up" | "down" | "flat";
}

export interface Kpi {
  ae_rows: number;
  ae_rows_delta: Delta;
  unique_posts: number;
  reactions_per_post: number;
  serious_pct: number;
  serious_pct_delta: Delta;
  unique_ingredients: number;
  unique_brands: number;
  meddra_pt_count: number;
  meddra_soc_count: number;
}

export interface AeRow {
  id: number;
  drug_ingredient: string | null;
  drug_brand_name: string | null;
  reaction: string | null;
  meddra_pt: string | null;
  meddra_soc: string | null;
  severity: string | null;
  is_serious: string;
  language: string;
  source: string;
  published_at: string;
  text: string | null;
}

export interface PostRow {
  id: number;
  drug_ingredient: string | null;
  drug_brand_name: string | null;
  language: string;
  source: string;
  published_at: string;
  is_serious: string;
  text: string | null;
  reactions: string[];
}

export interface BrandOut {
  name: string;
  post_count: number;
}

export interface TopReaction {
  pt: string;
  reaction_count: number;
}

export interface IngredientOut {
  name: string;
  post_count: number;
  reaction_count: number;
  drug_category: string | null;
}

export interface SourceOut {
  name: string;
  reaction_count: number;
  post_count: number;
}

export interface PtNode {
  pt: string;
  reaction_count: number;
  serious_count: number;
}

export interface SocNode {
  soc: string;
  pt_count: number;
  reaction_count: number;
  serious_count: number;
  pts: PtNode[];
}

export interface TrendPoint {
  month: string;
  source: string;
  count: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Filters {
  drug_ingredient: string[];
  drug_brand_name: string[];
  meddra_soc: string | null;
  meddra_pt: string | null;
  severity: string[];
  is_serious: boolean | null;
  language: string | null;
  source: string | null;
  drug_category: string | null;
}

export const EMPTY_FILTERS: Filters = {
  drug_ingredient: [],
  drug_brand_name: [],
  meddra_soc: null,
  meddra_pt: null,
  severity: [],
  is_serious: null,
  language: null,
  source: null,
  drug_category: null,
};
