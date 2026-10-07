/**
 * Estrutura comum a todas as páginas.
 * - ScrollManager: volta ao topo ao trocar de página ou rola até a âncora (#categorias, #faq...).
 * - WhatsAppButton: botão flutuante do WhatsApp.
 * - Layout: Header + conteúdo da página (<Outlet/>) + Footer + Sacola + Busca + avisos (toasts).
 */
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiWhatsapp } from "@icons-pack/react-simple-icons";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SearchModal } from "@/components/shop/SearchModal";
import { WHATSAPP_URL } from "@/lib/format";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Fale conosco no WhatsApp"
      data-testid="whatsapp-float-button"
      className="group fixed right-5 bottom-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <SiWhatsapp size={22} color="currentColor" />
      <span className="hidden max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-[max-width] duration-500 group-hover:max-w-[160px] sm:inline">
        Fale com a gente
      </span>
    </a>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <WhatsAppButton />
      <Toaster position="bottom-right" offset={{ bottom: 92, right: 20 }} mobileOffset={{ bottom: 92 }} />
    </div>
  );
}
