/**
 * Galeria da página de produto: miniaturas + imagem principal com zoom que segue o mouse
 * (no celular, toque para ampliar).
 */
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4" data-testid="product-gallery">
      <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            data-testid={`product-gallery-thumb-${i}`}
            aria-label={`Ver imagem ${i + 1}`}
            className={cn(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border bg-nude transition-[border-color,opacity] duration-300 lg:w-20",
              i === active ? "border-blush" : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-nude"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        onClick={() => setZoom((z) => !z)}
        data-testid="product-gallery-main"
      >
        <img
          src={images[active]}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 ease-out"
          style={{ transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: origin }}
        />
        <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-surface/85 px-3 py-1 text-[11px] font-medium text-blush backdrop-blur">
          {active + 1} / {images.length} · passe o mouse para ampliar
        </span>
      </div>
    </div>
  );
}
