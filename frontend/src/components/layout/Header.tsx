/**
 * Cabeçalho do site.
 * - NAV: itens do menu (edite aqui para mudar o menu).
 * - AnnouncementBar: barra superior com mensagens (no celular, rola como letreiro).
 * - IconButton: botão redondo de ícone com contador opcional (favoritos/sacola).
 * - Header: fixo no topo; ao rolar a página fica menor, translúcido e com sombra.
 *   No desktop: logo à esquerda, menu central, ícones à direita.
 *   No celular: menu hambúrguer + busca à esquerda, logo central, sacola à direita.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useShop } from "@/lib/store";
import { useMe } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const NAV = [
  { label: "Início", to: "/" },
  { label: "Presentes", to: "/produtos" },
  { label: "Categorias", to: "/#categorias" },
  { label: "Personalizados", to: "/produtos?categoria=brindes" },
  { label: "Mais vendidos", to: "/produtos?selo=mais-vendido" },
  { label: "Sobre nós", to: "/sobre" },
  { label: "Contato", to: "/contato" },
];

const MESSAGES = ["Personalizados feitos com carinho", "Enviamos para todo o Brasil", "Pagamento seguro", "5% off no Pix", "Frete grátis acima de R$ 299"];

function AnnouncementBar() {
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-night text-[11px] tracking-[0.14em] text-blush uppercase" data-testid="announcement-bar">
      <div className="hidden justify-center gap-6 py-2.5 md:flex">
        {MESSAGES.slice(0, 3).map((m, i) => (
          <span key={m} className="flex items-center gap-6">
            {i > 0 && <span className="text-blush/60">•</span>}
            {m}
          </span>
        ))}
      </div>
      <div className="flex w-max animate-marquee gap-8 py-2.5 md:hidden">
        {row.map((m, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {m} <span className="text-blush/60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function IconButton({ label, onClick, to, testid, children, badge, className }: {
  label: string;
  onClick?: () => void;
  to?: string;
  testid: string;
  children: React.ReactNode;
  badge?: number;
  className?: string;
}) {
  const cls = cn(
    "relative grid h-10 w-10 place-items-center rounded-full text-ink transition-[background-color,color] duration-300 hover:bg-champagne/70 hover:text-blush",
    className,
  );
  const inner = (
    <>
      {children}
      {!!badge && (
        <span
          data-testid={`${testid}-count`}
          className="absolute top-1 right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blush px-1 text-[10px] font-semibold text-night"
        >
          {badge}
        </span>
      )}
    </>
  );
  return to ? (
    <Link to={to} aria-label={label} data-testid={testid} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={label} data-testid={testid} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function Header() {
  const { cartCount, favorites, setCartOpen, setSearchOpen } = useShop();
  const me = useMe();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to: string) => {
    const [path, query] = to.split("?");
    if (to.includes("#")) return false;
    if (path === "/") return location.pathname === "/";
    if (query) return location.pathname === path && location.search === `?${query}`;
    return location.pathname === path && !location.search;
  };

  const ic = "h-[19px] w-[19px]";

  return (
    <>
      <AnnouncementBar />
      <header
        data-testid="site-header"
        data-scrolled={scrolled}
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
          scrolled
            ? "border-line/80 bg-ivory/85 shadow-[0_6px_24px_-12px_rgba(30,43,77,0.12)] backdrop-blur-xl"
            : "border-transparent bg-ivory",
        )}
      >
        <div className={cn("mx-auto flex max-w-7xl items-center px-4 transition-[height] duration-500 sm:px-8", scrolled ? "h-16" : "h-[76px] lg:h-[88px]")}>
          {/* mobile left */}
          <div className="flex flex-1 items-center gap-1 lg:hidden">
            <IconButton label="Abrir menu" testid="mobile-menu-button" onClick={() => setMenuOpen(true)}>
              <Menu className={ic} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Pesquisar" testid="mobile-search-button" onClick={() => setSearchOpen(true)}>
              <Search className={ic} strokeWidth={1.5} />
            </IconButton>
          </div>

          <Link to="/" aria-label="Gifts da No — página inicial" data-testid="header-logo" className="shrink-0 lg:flex-1">
            <img
              src="/logo-pink.png"
              alt="Gifts da No"
              className={cn("w-auto transition-[height] duration-500", scrolled ? "h-12" : "h-[56px] lg:h-[70px]")}
            />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                data-testid={`nav-link-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "relative py-2 text-[13px] font-medium tracking-wide whitespace-nowrap text-ink/80 transition-colors hover:text-blush",
                  "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-blush after:transition-transform after:duration-500 hover:after:scale-x-100",
                  isActive(n.to) && "text-blush after:scale-x-100",
                )}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
            <IconButton label="Pesquisar" testid="header-search-button" onClick={() => setSearchOpen(true)} className="hidden lg:grid">
              <Search className={ic} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Minha conta" testid="header-account-button" to="/conta" className="hidden sm:grid">
              {me.data?.picture ? (
                <img src={me.data.picture} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <User className={ic} strokeWidth={1.5} />
              )}
            </IconButton>
            <IconButton label="Favoritos" testid="header-favorites-button" to="/favoritos" badge={favorites.length} className="hidden sm:grid">
              <Heart className={ic} strokeWidth={1.5} />
            </IconButton>
            <IconButton label="Abrir sacola" testid="header-cart-button" onClick={() => setCartOpen(true)} badge={cartCount}>
              <ShoppingBag className={ic} strokeWidth={1.5} />
            </IconButton>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[86%] bg-ivory p-0 sm:max-w-sm" data-testid="mobile-menu">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="border-b border-line px-6 py-5">
            <img src="/logo-pink.png" alt="Gifts da No" className="h-14 w-auto" />
          </div>
          <nav className="flex flex-col px-6 py-4" aria-label="Menu mobile">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                data-testid={`mobile-nav-link-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="border-b border-line/70 py-4 font-serif text-xl text-ink transition-colors hover:text-blush"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid grid-cols-2 gap-2 px-6 pb-8">
            <Link to="/conta" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface py-3 text-sm text-blush" data-testid="mobile-menu-account">
              <User className="h-4 w-4" strokeWidth={1.5} /> Conta
            </Link>
            <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-full border border-line bg-surface py-3 text-sm text-blush" data-testid="mobile-menu-favorites">
              <Heart className="h-4 w-4" strokeWidth={1.5} /> Favoritos
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
