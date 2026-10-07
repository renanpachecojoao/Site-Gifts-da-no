import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Clock, Heart, Leaf, Mail, MapPin, Sparkles } from "lucide-react";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import type { Message } from "@/lib/types";
import { IMAGES } from "@/lib/images";
import { WHATSAPP_URL } from "@/lib/format";
import { Reveal, container } from "@/components/shop/primitives";

const VALUES = [
  { Icon: Heart, t: "Afeto em cada detalhe", d: "Escolhemos materiais, aromas e acabamentos como se fossem para alguém da nossa família." },
  { Icon: Sparkles, t: "Personalização de verdade", d: "Nomes, datas, mensagens e fotos — revisados um a um antes da produção." },
  { Icon: Leaf, t: "Escolhas conscientes", d: "Materiais duráveis, papéis certificados e fornecedores locais sempre que possível." },
];

export function About() {
  useEffect(() => {
    document.title = "Sobre nós · Gifts da No";
  }, []);
  return (
    <div>
      <section className={`${container} grid items-center gap-12 py-14 lg:grid-cols-12 lg:py-24`}>
        <div className="lg:col-span-6">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Sobre nós</p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-normal tracking-tight text-ink sm:text-6xl" data-testid="about-title">
            Afetos que <em className="text-blush italic">encantam</em>.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-soft">
            A Gifts da No nasceu da vontade de transformar presentes em lembranças. Cada ímã, chaveiro e espelhinho sai do nosso ateliê pensado para o
            exato momento em que alguém o recebe.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="aspect-[4/3] overflow-hidden rounded-[2rem]">
            <img src={IMAGES.atelier} alt="Ateliê Gifts da No" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section id="historia" className="scroll-mt-24 bg-surface py-20 sm:py-28">
        <div className={`${container} grid gap-12 lg:grid-cols-12`}>
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Nossa história</p>
            <h2 className="mt-3 text-4xl font-normal text-ink">De uma mesa de cozinha para todo o Brasil</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-slate-soft lg:col-span-7 lg:col-start-6">
            <p>
              Tudo começou com um ímã personalizado que a fundadora, Noemi, criou para a festa da sobrinha. A reação dela — e os pedidos de amigas que
              vieram depois — mostraram que um presente pensado com cuidado tem o poder de guardar um momento para sempre.
            </p>
            <p>
              Hoje somos um pequeno ateliê com designers, prensas e uma equipe que confere cada peça à mão. Já enviamos mais de 12 mil presentes,
              mas continuamos revisando cada arte, cada nome e cada laço como no primeiro dia.
            </p>
          </div>
        </div>
      </section>

      <section className={`${container} py-20 sm:py-28`}>
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-line bg-surface p-8">
                <Icon className="h-6 w-6 text-cocoa" strokeWidth={1.3} />
                <h3 className="mt-6 font-serif text-xl text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-soft">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link to="/produtos" className="inline-flex h-12 items-center rounded-full bg-blush px-8 text-sm text-night" data-testid="about-shop-link">
            Conheça nossos presentes
          </Link>
        </div>
      </section>
    </div>
  );
}

const FAQ = [
  { q: "Qual o prazo de produção?", a: "Cada produto informa seu prazo de produção (em geral de 2 a 7 dias úteis). Ele é somado ao prazo de entrega escolhido no checkout." },
  { q: "Como funcionam as entregas?", a: "Enviamos para todo o Brasil via PAC e SEDEX, com código de rastreio. Compras acima de R$ 299 têm frete grátis no PAC." },
  { q: "Posso ver a personalização antes?", a: "Sim! Enviamos uma prévia pelo WhatsApp para aprovação antes de produzir qualquer item personalizado." },
  { q: "Quais as formas de pagamento?", a: "Pix com 5% de desconto, cartão de crédito em até 6x sem juros e cartão de débito." },
  { q: "Vocês fazem kits corporativos?", a: "Fazemos! Envie uma mensagem com a quantidade e a data do evento para recebermos uma proposta personalizada." },
];

const POLICIES = [
  { t: "Política de privacidade", d: "Usamos seus dados apenas para processar pedidos e, se você permitir, enviar novidades. Nunca vendemos ou compartilhamos suas informações." },
  { t: "Termos de uso", d: "Ao comprar na Gifts da No você concorda com os prazos e condições descritos em cada produto e no checkout." },
  { t: "Trocas e devoluções", d: "Itens não personalizados podem ser devolvidos em até 7 dias após o recebimento. Itens personalizados são trocados em caso de defeito de produção." },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  useEffect(() => {
    document.title = "Contato · Gifts da No";
  }, []);
  const m = useMutation({
    mutationFn: () => apiPost<Message>("/contact", form),
    onSuccess: (r) => {
      toast.success(r.message);
      setForm({ name: "", email: "", message: "" });
    },
    onError: () => toast.error("Preencha nome, e-mail válido e mensagem"),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    m.mutate();
  };
  return (
    <div className={`${container} py-14 sm:py-20`}>
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Contato</p>
          <h1 className="mt-3 text-5xl font-normal tracking-tight text-ink" data-testid="contact-title">
            Vamos criar algo especial juntas?
          </h1>
          <p className="mt-5 text-slate-soft">Respondemos em até 1 dia útil. Para pedidos urgentes, chame no WhatsApp.</p>
          <ul className="mt-10 space-y-5 text-sm">
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-ink hover:text-blush" data-testid="contact-whatsapp-link">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-[#25D366] ring-1 ring-line"><SiWhatsapp size={16} color="currentColor" /></span>
                (11) 99999-9999
              </a>
            </li>
            <li className="flex items-center gap-3 text-ink">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line"><Mail className="h-4 w-4 text-blush" strokeWidth={1.5} /></span>
              contato@giftsdano.com.br
            </li>
            <li className="flex items-center gap-3 text-ink">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line"><Clock className="h-4 w-4 text-blush" strokeWidth={1.5} /></span>
              Seg a sex, 9h às 18h · Sáb, 9h às 13h
            </li>
            <li className="flex items-center gap-3 text-ink">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-line"><MapPin className="h-4 w-4 text-blush" strokeWidth={1.5} /></span>
              Ateliê em São Paulo, SP
            </li>
          </ul>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-line bg-surface p-6 sm:p-10 lg:col-span-7" data-testid="contact-form">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="h-12 rounded-xl" data-testid="contact-name-input" />
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Seu e-mail" className="h-12 rounded-xl" data-testid="contact-email-input" />
          </div>
          <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Conte o que você precisa: ocasião, quantidade, ideias…" className="min-h-40 rounded-xl" data-testid="contact-message-input" />
          <button type="submit" disabled={m.isPending} className="h-12 rounded-full bg-blush px-8 text-sm font-medium text-night transition-colors hover:bg-blush-deep disabled:opacity-60" data-testid="contact-submit-button">
            {m.isPending ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      </div>

      <section id="faq" className="mt-24 scroll-mt-24 lg:grid lg:grid-cols-12 lg:gap-14">
        <h2 className="text-3xl font-normal text-ink lg:col-span-4">Perguntas frequentes</h2>
        <div className="mt-8 divide-y divide-line border-y border-line lg:col-span-8 lg:mt-0">
          {FAQ.map((f, i) => (
            <details key={f.q} className="group py-5" data-testid={`faq-item-${i}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-ink">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-soft transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="politicas" className="mt-24 scroll-mt-24">
        <h2 className="text-3xl font-normal text-ink">Políticas</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {POLICIES.map((p) => (
            <div key={p.t} className="rounded-3xl border border-line bg-surface p-7" data-testid={`policy-${p.t.toLowerCase().split(" ")[0]}`}>
              <h3 className="font-serif text-xl text-ink">{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-soft">{p.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function NotFound() {
  return (
    <div className={`${container} py-32 text-center`} data-testid="not-found">
      <p className="font-serif text-7xl text-champagne">404</p>
      <h1 className="mt-4 text-3xl text-ink">Esta página se perdeu no embrulho</h1>
      <Link to="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-blush px-8 text-sm text-night">
        Voltar ao início
      </Link>
    </div>
  );
}
