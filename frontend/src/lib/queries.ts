import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "./api";
import type { Category, Product, Quote, QuoteRequest, Review, User } from "./types";

export interface ProductFilters {
  q?: string;
  categoria?: string;
  selo?: string;
  min_price?: number;
  max_price?: number;
  ordenar?: string;
  limit?: number;
}

const qs = (f: ProductFilters) => {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const useProducts = (f: ProductFilters = {}, enabled = true) =>
  useQuery({
    queryKey: ["products", f],
    queryFn: () => apiGet<Product[]>(`/products${qs(f)}`),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useProduct = (slug: string) =>
  useQuery({ queryKey: ["product", slug], queryFn: () => apiGet<Product>(`/products/${slug}`), retry: false });

export const useRelated = (slug: string) =>
  useQuery({ queryKey: ["related", slug], queryFn: () => apiGet<Product[]>(`/products/${slug}/related`) });

export const useReviews = (slug: string) =>
  useQuery({ queryKey: ["reviews", slug], queryFn: () => apiGet<Review[]>(`/products/${slug}/reviews`) });

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: () => apiGet<Category[]>("/categories"), staleTime: 5 * 60_000 });

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<User | null>("/auth/me"),
    retry: false,
    staleTime: 60_000,
  });

export const useQuote = (req: QuoteRequest, enabled: boolean) =>
  useQuery({
    queryKey: ["quote", req],
    queryFn: () => apiPost<Quote>("/cart/quote", req),
    enabled,
    retry: false,
    placeholderData: keepPreviousData,
  });

export const googleLogin = (returnPath = "/conta") => {
  const redirect = `${window.location.origin}${returnPath}`;
  window.location.assign(`https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`);
};
