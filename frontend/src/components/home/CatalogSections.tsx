import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCategories, useProducts } from "@/lib/queries";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ProductGrid } from "@/components/shop/ProductCard";
import { Reveal, SectionHeading, container } from "@/components/shop/primitives";

export function CategoriesSection() {
  const { data, isError } = useCategories();
  return (
    <section id="categorias" className="scroll-mt-24 py-20 sm:py-28" aria-labelledby="categorias-title">
      <div className={container}>
        <SectionHeading
          id="categorias-title"
          overline="Categorias"
          title="Encontre o presente ideal"
          subtitle="Curadoria pensada para cada pessoa e cada ocasião — do primeiro encontro às grandes celebrações."
        />
        {data && !isError ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {data.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 5) * 0.06}>
                <CategoryCard category={c} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-nude" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function BestSellers() {
  const { data, isLoading, isError } = useProducts({ ordenar: "relevancia", limit: 8 });
  return (
    <section className="bg-surface py-20 sm:py-28" aria-labelledby="mais-amados-title">
      <div className={container}>
        <SectionHeading
          id="mais-amados-title"
          overline="Favoritos de quem presenteia"
          title="Mais amados"
          subtitle="Os presentes que mais emocionaram nossos clientes neste mês."
          action={
            <Link
              to="/produtos"
              data-testid="bestsellers-view-all-top"
              className="group hidden items-center gap-2 text-sm font-medium text-blush md:inline-flex"
            >
              Ver todos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />
        <ProductGrid products={data} loading={isLoading} error={isError} />
        <div className="mt-14 flex justify-center">
          <Link
            to="/produtos"
            data-testid="bestsellers-view-all-button"
            className="inline-flex h-12 items-center rounded-full border border-blush/40 px-8 text-sm font-medium text-blush transition-[background-color,color,border-color] duration-300 hover:border-blush hover:bg-blush hover:text-night"
          >
            Ver todos os produtos
          </Link>
        </div>
      </div>
    </section>
  );
}
