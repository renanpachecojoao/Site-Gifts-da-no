import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPct, finalPrice, installmentsText, money } from "@/lib/format";
import { useShop } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Stars } from "./primitives";

const BADGE_STYLE: Record<string, string> = {
  "Mais vendido": "bg-blush text-night",
  Novo: "bg-surface text-blush ring-1 ring-blush/15",
  Oferta: "bg-rose text-night",
};

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { isFavorite, toggleFavorite, addToCart } = useShop();
  const fav = isFavorite(product.id);
  const price = finalPrice(product);
  const pct = discountPct(product);
  const tid = `product-card-${product.slug}`;

  const quickBuy = () => {
    const options: Record<string, string> = {};
    product.personalization.options.forEach((g) => (options[g.name] = g.values[0]));
    addToCart({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unit_price: price,
      quantity: 1,
      options,
      personalization_name: "",
      personalization_message: "",
      upload_url: "",
    });
  };

  return (
    <article
      data-testid={tid}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(30,43,77,0.18)]",
        className,
      )}
    >
      <Link to={`/produto/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-nude" data-testid={`${tid}-link`}>
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.03]"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span
              data-testid={`${tid}-badge`}
              className={cn("rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase", BADGE_STYLE[product.badge])}
            >
              {product.badge}
            </span>
          )}
          {pct > 0 && (
            <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-rose backdrop-blur">-{pct}%</span>
          )}
        </div>
      </Link>
      <button
        type="button"
        data-testid={`${tid}-favorite-button`}
        aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
        aria-pressed={fav}
        onClick={() => toggleFavorite(product.id, product.name)}
        className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-blush backdrop-blur transition-[transform,background-color] duration-300 hover:scale-105 hover:bg-surface active:scale-95"
      >
        <Heart className={cn("h-4 w-4 transition-colors", fav && "fill-rose text-rose")} strokeWidth={1.6} />
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-soft">
          <Stars value={product.rating} size={12} />
          <span>({product.reviews_count})</span>
        </div>
        <Link to={`/produto/${product.slug}`} className="focus-visible:outline-none">
          <h3 className="font-serif text-lg leading-snug text-ink transition-colors group-hover:text-blush" data-testid={`${tid}-name`}>
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-soft">{product.short_description}</p>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {product.promo_price && (
              <span className="text-sm text-slate-soft/80 line-through" data-testid={`${tid}-old-price`}>
                {money(product.price)}
              </span>
            )}
            <span className="text-lg font-semibold text-blush" data-testid={`${tid}-price`}>
              {money(price)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-soft">{installmentsText(price)}</p>
          <button
            type="button"
            onClick={quickBuy}
            data-testid={`${tid}-buy-button`}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-blush/40 text-sm font-medium text-blush transition-[background-color,color,border-color,transform] duration-300 hover:border-blush hover:bg-blush hover:text-night active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  loading,
  error,
  columns = "default",
  emptyText = "Nenhum presente encontrado.",
}: {
  products?: Product[];
  loading?: boolean;
  error?: boolean;
  columns?: "default" | "three";
  emptyText?: string;
}) {
  const grid =
    columns === "three"
      ? "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3"
      : "grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4";
  if (loading && !products)
    return (
      <div className={grid} data-testid="product-grid-loading">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="aspect-[4/5] animate-pulse bg-nude" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-nude" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-nude" />
            </div>
          </div>
        ))}
      </div>
    );
  if (error || !products || products.length === 0)
    return (
      <div data-testid="product-grid-empty" className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center text-slate-soft">
        {error ? "Não foi possível carregar os produtos agora. Tente novamente em instantes." : emptyText}
      </div>
    );
  return (
    <div className={grid} data-testid="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
