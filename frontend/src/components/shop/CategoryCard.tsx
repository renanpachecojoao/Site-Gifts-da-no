/**
 * Card de categoria com imagem, frase e nome; leva para /produtos?categoria=slug.
 */
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className, tall }: { category: Category; className?: string; tall?: boolean }) {
  return (
    <Link
      to={`/produtos?categoria=${category.slug}`}
      data-testid={`category-card-${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-nude",
        tall ? "aspect-[3/4] lg:aspect-auto lg:h-full" : "aspect-[3/4]",
        className,
      )}
    >
      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="text-[10px] font-medium tracking-[0.2em] text-blush/90 uppercase">{category.tag}</p>
          <h3 className="mt-1 font-serif text-lg leading-tight text-ink sm:text-xl">{category.name}</h3>
        </div>
        <span className="grid h-9 w-9 shrink-0 translate-y-1 place-items-center rounded-full bg-ivory/95 text-blush opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
        </span>
      </div>
    </Link>
  );
}
