import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Instagram, Quote } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import type { Message } from "@/lib/types";
import { IMAGES } from "@/lib/images";
import { INSTAGRAM_URL } from "@/lib/format";
import { Reveal, SectionHeading, Stars, container } from "@/components/shop/primitives";

const TESTIMONIALS = [
  {
    name: "Mariana Castilho",
    city: "São Paulo, SP",
    avatar: IMAGES.avatars[0],
    product: "Kit Debutante 15 Anos",
    text: "As lembrancinhas da festa da minha filha ficaram perfeitas! Os ímãs e espelhinhos com o nome dela foram o assunto da festa. Acabamento impecável.",
  },
  {
    name: "Rafael Albuquerque",
    city: "Curitiba, PR",
    avatar: IMAGES.avatars[1],
    product: "Kit Abridores Casamento",
    text: "Pedimos 120 abridores com o nosso monograma para o casamento. Chegou tudo no prazo, embalado um a um. Os convidados amaram a lembrança útil.",
  },
  {
    name: "Beatriz Vianna",
    city: "Belo Horizonte, MG",
    avatar: IMAGES.avatars[2],
    product: "Chaveiro com a sua Marca",
    text: "Atendimento acolhedor pelo WhatsApp. Ajustaram a arte do logo da minha loja e mandaram a prévia antes de produzir. Já fiz o segundo pedido!",
  },
];

const METRICS = [
  { value: "4,9/5", label: "nota média das avaliações" },
  { value: "+12 mil", label: "presentes entregues" },
  { value: "98%", label: "recomendam a Gifts da No" },
  { value: "100%", label: "compra segura e protegida" },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="depoimentos-title">
      <div className={container}>
        <SectionHeading id="depoimentos-title" overline="Depoimentos" title="Quem recebe, ama." />
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure
                data-testid={`testimonial-card-${i}`}
                className={`flex h-full flex-col rounded-3xl border border-line bg-surface p-7 sm:p-8 ${i === 1 ? "md:translate-y-8" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <Stars value={5} />
                  <Quote className="h-6 w-6 text-champagne" strokeWidth={1.2} />
                </div>
                <blockquote className="mt-5 flex-1 font-serif text-[17px] leading-relaxed text-ink">“{t.text}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <img src={t.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-slate-soft">{t.city}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" /> Compra verificada
                  </span>
                </figcaption>
                <p className="mt-3 text-xs text-cocoa">Comprou: {t.product}</p>
              </figure>
            </Reveal>
          ))}
        </div>
        <dl className="mt-20 grid grid-cols-2 gap-y-8 border-t border-line pt-10 lg:grid-cols-4" data-testid="trust-metrics">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center lg:text-left">
              <dt className="font-serif text-4xl text-blush">{m.value}</dt>
              <dd className="mt-1 text-xs tracking-wide text-slate-soft">{m.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const FEED = [
  { img: IMAGES.quinze, cap: "Lembrancinhas dos 15 anos da Valentina" },
  { img: IMAGES.ima, cap: "Ímãs que decoram o dia a dia" },
  { img: IMAGES.atelier, cap: "Bastidores do ateliê" },
  { img: IMAGES.espelho, cap: "Espelhinhos com floral delicado" },
  { img: IMAGES.casamento, cap: "Abridores do casamento J & M" },
  { img: IMAGES.mini, cap: "Mini buttons para o caderno" },
];

export function InstagramFeed() {
  return (
    <section className="bg-surface py-20 sm:py-28" aria-labelledby="instagram-title">
      <div className={container}>
        <SectionHeading
          id="instagram-title"
          overline="Comunidade"
          title="Momentos que viraram presentes."
          action={
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              data-testid="instagram-follow-button"
              className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-blush/40 px-6 text-sm font-medium text-blush transition-[background-color,color] duration-300 hover:bg-blush hover:text-night md:self-auto"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.6} /> @giftsdano
            </a>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FEED.map((f, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              data-testid={`instagram-post-${i}`}
              className={`group relative block aspect-square overflow-hidden rounded-2xl bg-nude ${i % 2 === 1 ? "lg:mt-8" : ""}`}
            >
              <img src={f.img} alt={f.cap} loading="lazy" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-night/70 p-4 text-center text-xs text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
                {f.cap}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const m = useMutation({
    mutationFn: (e: string) => apiPost<Message>("/newsletter", { email: e }),
    onSuccess: (r) => {
      toast.success("Bem-vinda à nossa lista!", { description: r.message });
      setEmail("");
    },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 422 ? "Digite um e-mail válido" : "Não foi possível inscrever agora"),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) m.mutate(email.trim());
  };
  return (
    <section className="py-20 sm:py-24" aria-labelledby="newsletter-title">
      <div className={container}>
        <div className="relative overflow-hidden rounded-[2rem] bg-champagne px-6 py-14 sm:px-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-surface/50 blur-2xl" />
          <div className="relative">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Newsletter</p>
            <h2 id="newsletter-title" className="text-3xl leading-tight font-normal text-ink sm:text-4xl">
              Receba novidades e inspirações para presentear
            </h2>
            <p className="mt-3 text-sm text-slate-soft">Lançamentos, datas especiais e 10% off na primeira compra.</p>
          </div>
          <form onSubmit={submit} className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0" data-testid="newsletter-form">
            <label htmlFor="newsletter-email" className="sr-only">
              E-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu melhor e-mail"
              data-testid="newsletter-email-input"
              className="h-13 flex-1 rounded-full border border-surface bg-surface px-6 py-4 text-sm text-ink outline-none transition-[border-color] placeholder:text-slate-soft/70 focus:border-blush"
            />
            <button
              type="submit"
              disabled={m.isPending}
              data-testid="newsletter-submit-button"
              className="h-13 rounded-full bg-blush px-8 py-4 text-sm font-medium text-night transition-[background-color,transform] hover:bg-blush-deep active:scale-[0.98] disabled:opacity-60"
            >
              {m.isPending ? "Enviando…" : "Quero receber"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
