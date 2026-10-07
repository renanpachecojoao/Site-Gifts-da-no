/**
 * Página de produtos (/produtos).
 * Filtros ficam na URL (?categoria=, ?selo=, ?preco=, ?q=, ?ordenar=), então dá para compartilhar o link.
 * - Filtros laterais no desktop e em painel no celular; chips para remover filtros ativos; ordenação.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCategories, useProducts } from "@/lib/queries";
import { ProductGrid } from "@/components/shop/ProductCard";
import { container } from "@/components/shop/primitives";
import { cn } from "@/lib/utils";

const SORTS: Record<string, string> = {
  relevancia: "Mais vendidos",
  novidades: "Novidades",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  avaliacao: "Melhor avaliados",
};

const PRICES = [
  { id: "0-100", label: "Até R$ 100", min: undefined, max: 100 },
  { id: "100-150", label: "R$ 100 a R$ 150", min: 100, max: 150 },
  { id: "150-200", label: "R$ 150 a R$ 200", min: 150, max: 200 },
  { id: "200-", label: "Acima de R$ 200", min: 200, max: undefined },
];

const BADGES = [
  { id: "mais-vendido", label: "Mais vendido" },
  { id: "novo", label: "Novo" },
  { id: "oferta", label: "Oferta" },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categoria = params.get("categoria") ?? "";
  const selo = params.get("selo") ?? "";
  const q = params.get("q") ?? "";
  const ordenar = params.get("ordenar") ?? "relevancia";
  const faixa = params.get("preco") ?? "";
  const price = PRICES.find((p) => p.id === faixa);

  const cats = useCategories();
  const products = useProducts({ q, categoria, selo, ordenar, min_price: price?.min, max_price: price?.max });
  const catName = cats.data?.find((c) => c.slug === categoria)?.name;
  const title = q ? `Resultados para “${q}”` : catName ?? (selo === "mais-vendido" ? "Mais vendidos" : "Todos os presentes");

  useEffect(() => {
    document.title = `${title} · Gifts da No`;
  }, [title]);

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && next.get(key) !== value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const active = [
    categoria && { key: "categoria", label: catName ?? categoria },
    selo && { key: "selo", label: BADGES.find((b) => b.id === selo)?.label ?? selo },
    faixa && { key: "preco", label: price?.label ?? faixa },
    q && { key: "q", label: `“${q}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const Filters = (
    <div className="space-y-9">
      <div>
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-cocoa uppercase">Categorias</p>
        <ul className="space-y-1">
          {cats.data?.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                data-testid={`filter-category-${c.slug}`}
                onClick={() => set("categoria", c.slug)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  categoria === c.slug ? "bg-blush text-night" : "text-ink/80 hover:bg-champagne/60",
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-cocoa uppercase">Faixa de preço</p>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <button
              key={p.id}
              type="button"
              data-testid={`filter-price-${p.id}`}
              onClick={() => set("preco", p.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                faixa === p.id ? "border-blush bg-blush text-night" : "border-line bg-surface text-ink hover:border-blush/40",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-cocoa uppercase">Destaques</p>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <button
              key={b.id}
              type="button"
              data-testid={`filter-badge-${b.id}`}
              onClick={() => set("selo", b.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                selo === b.id ? "border-blush bg-blush text-night" : "border-line bg-surface text-ink hover:border-blush/40",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${container} py-10 sm:py-14`}>
      <nav className="text-xs text-slate-soft" aria-label="breadcrumb">
        Início <span className="mx-1.5">/</span> Presentes
      </nav>
      <div className="mt-4 flex flex-col gap-2 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight text-ink sm:text-5xl" data-testid="catalog-title">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-soft" data-testid="catalog-count">
            {products.data ? `${products.data.length} presentes selecionados com carinho` : "Carregando…"}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            data-testid="catalog-filters-button"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> Filtros
          </button>
          <Select value={ordenar} onValueChange={(v: string) => set("ordenar", v === "relevancia" ? "" : v)}>
            <SelectTrigger className="h-10 min-w-[180px] rounded-full bg-surface px-4" data-testid="catalog-sort-select">
              <SelectValue>{(v) => `Ordenar: ${SORTS[v as string] ?? "Mais vendidos"}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORTS).map(([k, label]) => (
                <SelectItem key={k} value={k} data-testid={`catalog-sort-${k}`}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {active.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2" data-testid="catalog-active-filters">
          {active.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => set(a.key, "")}
              data-testid={`active-filter-${a.key}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1.5 text-xs text-blush transition-colors hover:bg-nude"
            >
              {a.label} <X className="h-3 w-3" />
            </button>
          ))}
          <button type="button" onClick={() => setParams({}, { replace: true })} className="text-xs text-slate-soft underline underline-offset-4" data-testid="clear-filters-button">
            Limpar tudo
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-28">{Filters}</div>
        </aside>
        <ProductGrid products={products.data} loading={products.isLoading} error={products.isError} columns="three" />
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-[86%] overflow-y-auto bg-ivory p-6" data-testid="catalog-filters-sheet">
          <SheetTitle className="mb-4 font-serif text-2xl font-normal">Filtros</SheetTitle>
          {Filters}
        </SheetContent>
      </Sheet>
    </div>
  );
}
