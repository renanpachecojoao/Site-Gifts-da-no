import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, PackageCheck, PenLine, ShieldCheck } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { Reveal, SectionHeading, container } from "@/components/shop/primitives";

export function PersonalizeSection() {
  const [name, setName] = useState("Helena");
  return (
    <section className="relative overflow-hidden bg-night py-20 sm:py-28" aria-labelledby="personalize-title">
      <img src="/flowers-tr.png" alt="" aria-hidden className="pointer-events-none absolute top-0 right-0 w-40 opacity-80 sm:w-56" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-blush/10 blur-3xl" />
      <div className={`${container} relative grid items-center gap-14 lg:grid-cols-12`}>
        <div className="relative order-2 lg:order-1 lg:col-span-7">
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            <Reveal className="col-span-3 row-span-2">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-line">
                <img src={IMAGES.atelier} alt="Buttons sendo prensados no ateliê" loading="lazy" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="col-span-2">
              <div className="aspect-square overflow-hidden rounded-3xl ring-1 ring-line">
                <img src={IMAGES.brinde} alt="Brinde personalizado com laço" loading="lazy" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal delay={0.2} className="col-span-2">
              <div className="grid aspect-square place-items-center rounded-3xl border border-line bg-ivory">
                <div className="grid aspect-square w-[78%] place-items-center rounded-full bg-gradient-to-br from-champagne to-night p-[6%] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)] ring-1 ring-blush/50">
                  <div className="grid h-full w-full place-items-center rounded-full bg-blush text-center">
                    <span data-testid="personalize-preview-name" className="max-w-[85%] font-serif text-lg leading-tight break-words text-night italic sm:text-2xl">
                      {name || "Sua arte aqui"}
                      <span className="mt-1 block text-xs not-italic">♥</span>
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Personalização</p>
          <h2 id="personalize-title" className="text-4xl leading-[1.08] font-normal tracking-tight text-ink sm:text-5xl">
            Seu presente. <em className="text-blush italic">Do seu jeito.</em>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-soft">
            Escolha o produto, personalize os detalhes e transforme uma lembrança em algo único.
          </p>
          <div className="mt-8 max-w-sm rounded-2xl border border-line bg-surface/60 p-4 backdrop-blur">
            <label htmlFor="preview-name" className="text-[11px] tracking-[0.18em] text-slate-soft uppercase">
              Experimente: digite um nome
            </label>
            <input
              id="preview-name"
              data-testid="personalize-preview-input"
              value={name}
              maxLength={14}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-2xl text-ink outline-none focus:border-blush"
            />
          </div>
          <Link
            to="/produtos?categoria=brindes"
            data-testid="personalize-cta-button"
            className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-blush px-8 text-sm font-medium text-night transition-[background-color,transform] duration-300 hover:bg-blush-deep active:scale-[0.98]"
          >
            Quero personalizar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Escolha seu presente", text: "Ímãs, chaveiros, espelhinhos, abridores, mini buttons ou brindes — por produto ou ocasião.", Icon: Gift },
  { n: "02", title: "Personalize", text: "Envie sua arte, foto, nome ou logo. Criamos o layout e mandamos a prévia para você aprovar.", Icon: PenLine },
  { n: "03", title: "Finalize seu pedido", text: "Pague com Pix (5% off) ou em até 6x sem juros, com total segurança.", Icon: ShieldCheck },
  { n: "04", title: "Receba em casa", text: "Prensado e embalado à mão, pronto para entregar, com rastreio até a sua porta.", Icon: PackageCheck },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="como-funciona-title">
      <div className={container}>
        <SectionHeading id="como-funciona-title" overline="Simples e cuidadoso" title="Como funciona" />
        <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, text, Icon }, i) => (
            <li key={n} className="bg-ivory" data-testid={`how-step-${n}`}>
              <Reveal delay={i * 0.12} className="group h-full p-8 transition-colors duration-500 hover:bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-champagne transition-colors duration-500 group-hover:text-rose/60">{n}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-blush transition-[transform] duration-500 group-hover:-translate-y-1">
                    <Icon className="h-5 w-5" strokeWidth={1.4} />
                  </span>
                </div>
                <h3 className="mt-10 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-soft">{text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const OCCASIONS = [
  { title: "Lembrancinhas para festa de 15 anos", sub: "Festas de 15 anos", to: "festas-15-anos", img: IMAGES.quinze },
  { title: "Presente de casamento", sub: "Noivos, padrinhos e madrinhas", to: "casamentos", img: IMAGES.casamento },
  { title: "Brindes para o meu evento", sub: "Chás, batizados e aniversários", to: "eventos", img: IMAGES.imaKit },
  { title: "Kits para a minha empresa", sub: "Sua marca em destaque", to: "empresas", img: IMAGES.empresa },
  { title: "Presente para uma pessoa especial", sub: "Único como quem recebe", to: "brindes", img: IMAGES.chaveiro },
];

export function OccasionsSection() {
  return (
    <section className="bg-nude/60 py-20 sm:py-28" aria-labelledby="ocasioes-title">
      <div className={container}>
        <SectionHeading
          id="ocasioes-title"
          overline="Presentes por ocasião"
          title="Para qual momento é o seu presente?"
          subtitle="Comece pelo sentimento. A gente ajuda com o resto."
        />
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {OCCASIONS.map((o, i) => (
            <Link
              key={o.title}
              to={`/produtos?categoria=${o.to}`}
              data-testid={`occasion-card-${o.to}`}
              className={`group relative block min-h-[260px] overflow-hidden rounded-3xl ${i === 0 ? "md:col-span-2 lg:row-span-2 lg:min-h-[560px]" : ""}`}
            >
              <img src={o.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[11px] tracking-[0.2em] text-blush uppercase">{o.sub}</p>
                <h3 className={`mt-2 font-serif leading-tight text-ink ${i === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{o.title}</h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-ink/90">
                  Ver sugestões
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
