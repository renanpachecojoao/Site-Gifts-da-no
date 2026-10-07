import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { Stars, container } from "@/components/shop/primitives";

const TRUST = [
  { Icon: Sparkles, title: "Feito à mão", text: "Cada detalhe finalizado no ateliê" },
  { Icon: Truck, title: "Todo o Brasil", text: "Envio rastreado e embalagem protegida" },
  { Icon: ShieldCheck, title: "Pagamento seguro", text: "Pix com 5% off ou até 6x sem juros" },
  { Icon: MessageCircle, title: "Atendimento humano", text: "Ajudamos a escolher pelo WhatsApp" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-champagne/60 blur-3xl" />
      <img src="/flowers-tl.png" alt="" aria-hidden className="pointer-events-none absolute top-0 left-0 w-24 opacity-50 sm:w-48 sm:opacity-90" />
      <img src="/flowers-tr.png" alt="" aria-hidden className="pointer-events-none absolute top-0 right-0 w-20 opacity-50 sm:w-40 sm:opacity-90" />
      <div className={`${container} relative grid items-center gap-12 pt-8 pb-16 lg:grid-cols-12 lg:gap-10 lg:pt-14 lg:pb-24`}>
        <div className="lg:col-span-6 lg:pr-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-cocoa uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose" /> Ateliê de presentes personalizados
          </motion.p>
          <motion.h1
            id="hero-title"
            data-testid="hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease }}
            className="text-[42px] leading-[1.04] font-normal tracking-tight text-ink sm:text-6xl lg:text-[68px]"
          >
            Presentes que transformam <em className="font-normal text-blush italic">momentos</em> em memórias.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-6 max-w-md text-base leading-relaxed text-slate-soft sm:text-lg"
          >
            Encontre o presente perfeito ou personalize algo único para quem você ama.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/produtos"
              data-testid="hero-primary-cta"
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-blush px-8 py-4 text-sm font-medium tracking-wide text-night transition-[background-color,transform] duration-300 hover:bg-blush-deep active:scale-[0.98]"
            >
              Encontrar meu presente
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/produtos?categoria=brindes"
              data-testid="hero-secondary-cta"
              className="inline-flex h-13 items-center justify-center rounded-full border border-blush/40 bg-surface/60 px-8 py-4 text-sm font-medium tracking-wide text-blush transition-[background-color,border-color] duration-300 hover:border-blush hover:bg-surface"
            >
              Ver personalizados
            </Link>
          </motion.div>
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {IMAGES.avatars.map((a) => (
                <img key={a} src={a} alt="" className="h-9 w-9 rounded-full border-2 border-ivory object-cover" />
              ))}
            </div>
            <div className="text-xs leading-relaxed text-slate-soft">
              <Stars value={5} size={12} />
              <p>
                <strong className="font-semibold text-ink">4,9/5</strong> em mais de 2.300 avaliações
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="relative lg:col-span-6"
        >
          <div className="relative ml-auto aspect-[4/5] w-full max-w-[540px] overflow-hidden rounded-[2rem] bg-nude sm:aspect-[5/6]">
            <img src={IMAGES.hero} alt="Ímãs, chaveiro, espelhinho e abridor personalizados com laço rosa" className="h-full w-full object-cover" fetchPriority="high" />
          </div>
          <div className="absolute -bottom-6 left-0 hidden w-[260px] rounded-2xl border border-surface/60 bg-surface/85 p-4 shadow-[0_20px_50px_-20px_rgba(30,43,77,0.25)] backdrop-blur-md sm:block lg:-left-8" data-testid="hero-review-card">
            <Stars value={5} size={12} />
            <p className="mt-2 font-serif text-[15px] leading-snug text-ink">“As lembrancinhas da festa ficaram perfeitas. Todo mundo perguntou!”</p>
            <p className="mt-2 text-[11px] text-slate-soft">Camila R. · Kit Debutante 15 Anos</p>
          </div>
          <div className="absolute top-6 -left-2 hidden h-24 w-24 place-items-center rounded-full bg-night text-center text-[10px] leading-tight tracking-[0.16em] text-blush ring-1 ring-blush/40 uppercase shadow-lg sm:grid lg:-left-10">
            Feito
            <br />à mão
            <br />com afeto
          </div>
        </motion.div>
      </div>

      <div className="border-y border-line bg-surface/60">
        <div className={`${container} grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4`}>
          {TRUST.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 pr-4" data-testid={`trust-item-${title.toLowerCase().replace(/\s+/g, "-")}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cocoa" strokeWidth={1.4} />
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="text-xs leading-relaxed text-slate-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
