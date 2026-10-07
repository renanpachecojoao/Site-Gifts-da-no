/**
 * Peças visuais reutilizáveis.
 * - Reveal: animação suave de entrada quando o elemento aparece na tela.
 * - SectionHeading: título padrão das seções (sobretítulo, título, subtítulo e ação opcional).
 * - Stars: estrelas de avaliação.
 * - container: classes de largura máxima e margens laterais.
 */
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  overline,
  title,
  subtitle,
  action,
  className,
  id,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {overline && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cocoa">{overline}</p>
        )}
        <h2 id={id} className="text-3xl leading-[1.1] font-medium tracking-tight text-ink sm:text-4xl lg:text-[44px]">
          {title}
        </h2>
        {subtitle && <p className="mt-4 text-base leading-relaxed text-slate-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? "fill-cocoa text-cocoa" : "fill-transparent text-cocoa/30"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";
