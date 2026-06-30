import { useQuery } from "@tanstack/react-query";

import type {
  AeRow,
  BrandOut,
  Filters,
  IngredientOut,
  Kpi,
  Page,
  PostRow,
  SocNode,
  SourceOut,
  TopReaction,
  TrendPoint,
} from "@/types";
import { apiGet, filtersToParams } from "./client";

const STALE = 30_000;

export function useKpi(f: Filters) {
  return useQuery({
    queryKey: ["kpi", f],
    queryFn: () => apiGet<Kpi>("/kpi", filtersToParams(f)),
    staleTime: STALE,
  });
}

export function useReactions(f: Filters, page: number, pageSize = 50) {
  return useQuery({
    queryKey: ["reactions", f, page, pageSize],
    queryFn: () =>
      apiGet<Page<AeRow>>(
        "/reactions",
        filtersToParams(f, { page, page_size: pageSize }),
      ),
    staleTime: STALE,
  });
}

export function usePosts(f: Filters, page: number, pageSize = 50) {
  return useQuery({
    queryKey: ["posts", f, page, pageSize],
    queryFn: () =>
      apiGet<Page<PostRow>>(
        "/reviews",
        filtersToParams(f, { page, page_size: pageSize }),
      ),
    staleTime: STALE,
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: () => apiGet<IngredientOut[]>("/ingredients"),
    staleTime: 5 * 60_000,
  });
}

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: () => apiGet<SourceOut[]>("/sources"),
    staleTime: 5 * 60_000,
  });
}

export function useMedDRATree(f: Filters) {
  return useQuery({
    queryKey: ["meddra-tree", f],
    queryFn: () => apiGet<SocNode[]>("/meddra-tree", filtersToParams(f)),
    staleTime: STALE,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => apiGet<BrandOut[]>("/brands"),
    staleTime: 5 * 60_000,
  });
}

export function useTopReactions(f: Filters) {
  return useQuery({
    queryKey: ["top-reactions", f],
    queryFn: () => apiGet<TopReaction[]>("/top-reactions", filtersToParams(f)),
    staleTime: STALE,
  });
}

export function useTopBrands(f: Filters) {
  return useQuery({
    queryKey: ["top-brands", f],
    queryFn: () => apiGet<BrandOut[]>("/top-brands", filtersToParams(f)),
    staleTime: STALE,
  });
}

export function useTrends() {
  return useQuery({
    queryKey: ["trends"],
    queryFn: () => apiGet<TrendPoint[]>("/trends"),
    staleTime: 5 * 60_000,
  });
}
