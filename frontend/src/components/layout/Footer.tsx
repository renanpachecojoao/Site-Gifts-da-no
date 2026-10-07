import { Link } from "react-router-dom";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { SiFacebook, SiInstagram, SiPix, SiTiktok, SiWhatsapp } from "@icons-pack/react-simple-icons";
import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/format";

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Gifts da No",
    links: [
      { label: "Sobre nós", to: "/sobre" },
      { label: "Nossa história", to: "/sobre#historia" },
      { label: "Contato", to: "/contato" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Fale conosco", to: "/contato" },
      { label: "WhatsApp", to: WHATSAPP_URL },
      { label: "Perguntas frequentes", to: "/contato#faq" },
      { label: "Prazo de produção", to: "/contato#faq" },
      { label: "Entregas", to: "/contato#faq" },
    ],
  },
  {
    title: "Compra",
    links: [
      { label: "Minha conta", to: "/conta" },
      { label: "Meus pedidos", to: "/conta" },
      { label: "Favoritos", to: "/favoritos" },
      { label: "Carrinho", to: "/checkout" },
    ],
  },
  {
    title: "Políticas",
    links: [
      { label: "Política de privacidade", to: "/contato#politicas" },
      { label: "Termos de uso", to: "/contato#politicas" },
      { label: "Trocas e devoluções", to: "/contato#politicas" },
    ],
  },
];

const SOCIAL = [
  { label: "Instagram", href: INSTAGRAM_URL, Icon: SiInstagram },
  { label: "Facebook", href: "https://facebook.com/giftsdano", Icon: SiFacebook },
  { label: "TikTok", href: "https://tiktok.com/@giftsdano", Icon: SiTiktok },
  { label: "WhatsApp", href: WHATSAPP_URL, Icon: SiWhatsapp },
];

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

export function Footer() {
  return (
    <footer className="bg-night text-slate-soft" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <img src="/logo-pink.png" alt="Gifts da No — Afetos que encantam" className="h-28 w-auto" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-soft">
              Presentes personalizados feitos à mão, com acabamento delicado e embalagem pensada para emocionar quem recebe.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-testid={`footer-social-${label.toLowerCase()}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-[background-color,color,border-color] duration-300 hover:border-blush hover:bg-blush hover:text-night"
                >
                  <Icon size={15} color="currentColor" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="mb-5 font-serif text-lg text-ink">{c.title}</p>
                <ul className="space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.to.startsWith("http") ? (
                        <a href={l.to} target="_blank" rel="noreferrer" className="text-sm text-slate-soft transition-colors hover:text-blush" data-testid={`footer-link-${slug(l.label)}`}>
                          {l.label}
                        </a>
                      ) : (
                        <Link to={l.to} className="text-sm text-slate-soft transition-colors hover:text-blush" data-testid={`footer-link-${slug(l.label)}`}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2" data-testid="footer-payments">
            <span className="mr-2 text-[11px] tracking-[0.2em] text-slate-soft/70 uppercase">Pagamento</span>
            <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs">
              <SiPix size={12} color="currentColor" /> Pix
            </span>
            <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs">
              <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} /> Cartão de crédito
            </span>
            <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs">
              <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} /> Cartão de débito
            </span>
          </div>
          <div className="flex items-center gap-3" data-testid="footer-secure-seal">
            <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs text-ink">
              <ShieldCheck className="h-4 w-4 text-blush" strokeWidth={1.5} /> Compra segura
            </span>
            <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs text-ink">
              <Lock className="h-3.5 w-3.5 text-blush" strokeWidth={1.5} /> SSL 256 bits
            </span>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-slate-soft/60">
          © {new Date().getFullYear()} Gifts da No · Afetos que encantam. CNPJ 00.000.000/0001-00 · Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
