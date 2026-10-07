/**
 * Páginas da área do cliente.
 * - Account (/conta): login com Google; ao voltar do Google lê o session_id da URL, troca por
 *   uma sessão segura (cookie) e mostra perfil + 'Meus pedidos'. Botão Sair encerra a sessão.
 * - Favorites (/favoritos): produtos marcados com coração.
 */
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, LogOut, Package } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { beginSession, endSession } from "@/lib/session";
import { googleLogin, useMe, useProducts } from "@/lib/queries";
import { useShop } from "@/lib/store";
import { money } from "@/lib/format";
import type { Order, User } from "@/lib/types";
import { ProductGrid } from "@/components/shop/ProductCard";
import { container } from "@/components/shop/primitives";
import { IMAGES } from "@/lib/images";

export function Account() {
  const me = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const ran = useRef(false);

  const exchange = useMutation({
    mutationFn: (session_id: string) => apiPost<User>("/auth/google/exchange", { session_id }),
    onSuccess: (u) => {
      beginSession();
      qc.setQueryData(["me"], u);
      toast.success(`Bem-vinda, ${u.name?.split(" ")[0] ?? ""}!`);
      navigate("/conta", { replace: true });
    },
    onError: () => {
      toast.error("Não foi possível entrar com o Google");
      navigate("/conta", { replace: true });
    },
  });

  useEffect(() => {
    document.title = "Minha conta · Gifts da No";
    if (ran.current) return;
    const sid = new URLSearchParams(window.location.hash.slice(1)).get("session_id");
    if (sid) {
      ran.current = true;
      exchange.mutate(sid);
    }
  }, [exchange]);

  const orders = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => apiGet<Order[]>("/orders/mine"),
    enabled: !!me.data,
  });

  if (exchange.isPending)
    return <div className={`${container} py-32 text-center text-slate-soft`} data-testid="account-signing-in">Entrando…</div>;

  if (!me.data)
    return (
      <div className={`${container} grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20`}>
        <div className="hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
          <img src={IMAGES.atelier} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mx-auto w-full max-w-md" data-testid="account-login">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Minha conta</p>
          <h1 className="mt-3 text-4xl font-normal text-ink sm:text-5xl">Entre para acompanhar seus presentes</h1>
          <p className="mt-4 text-slate-soft">Veja seus pedidos, salve favoritos e finalize compras mais rápido.</p>
          <button
            type="button"
            onClick={() => googleLogin("/conta")}
            data-testid="account-google-login-button"
            className="mt-10 flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface text-sm font-medium text-ink shadow-[0_6px_20px_-12px_rgba(30,43,77,0.25)] transition-[border-color,transform] hover:border-blush active:scale-[0.99]"
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continuar com Google
          </button>
          <p className="mt-6 text-center text-xs text-slate-soft">Você também pode comprar sem conta — é só seguir para o checkout.</p>
        </div>
      </div>
    );

  const u = me.data;
  return (
    <div className={`${container} py-12 sm:py-16`} data-testid="account-dashboard">
      <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {u.picture ? (
            <img src={u.picture} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-full bg-champagne font-serif text-2xl text-blush">{(u.name ?? u.email)[0]}</span>
          )}
          <div>
            <h1 className="text-3xl font-normal text-ink" data-testid="account-name">Olá, {u.name?.split(" ")[0] ?? "querida"}</h1>
            <p className="text-sm text-slate-soft">{u.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => endSession("/")}
          data-testid="account-logout-button"
          className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-line px-5 text-sm text-ink hover:border-blush"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sair
        </button>
      </div>

      <h2 className="mt-10 mb-5 text-2xl font-normal text-ink">Meus pedidos</h2>
      {orders.data && orders.data.length > 0 ? (
        <ul className="space-y-3" data-testid="account-orders">
          {orders.data.map((o) => (
            <li key={o.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center" data-testid={`account-order-${o.number}`}>
              <div className="flex -space-x-3">
                {o.items.slice(0, 3).map((i, k) => (
                  <img key={k} src={i.image} alt="" className="h-14 w-14 rounded-xl border-2 border-surface object-cover" />
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Pedido #{o.number}</p>
                <p className="text-xs text-slate-soft">
                  {new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.items.length} {o.items.length === 1 ? "item" : "itens"}
                </p>
              </div>
              <span className="rounded-full bg-champagne px-3 py-1 text-xs text-blush">{o.status}</span>
              <span className="text-sm font-semibold text-blush">{money(o.total)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line p-8 text-sm text-slate-soft" data-testid="account-orders-empty">
          <Package className="h-6 w-6 text-cocoa" strokeWidth={1.4} />
          {orders.isLoading ? "Carregando pedidos…" : "Você ainda não fez pedidos. Que tal começar pelos mais amados?"}
        </div>
      )}
    </div>
  );
}

export function Favorites() {
  const { favorites } = useShop();
  const all = useProducts({ limit: 200 });
  const items = all.data?.filter((p) => favorites.includes(p.id));
  useEffect(() => {
    document.title = "Favoritos · Gifts da No";
  }, []);
  return (
    <div className={`${container} py-12 sm:py-16`}>
      <p className="text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Lista de desejos</p>
      <h1 className="mt-3 mb-10 text-4xl font-normal text-ink sm:text-5xl" data-testid="favorites-title">
        Seus favoritos
      </h1>
      {favorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line px-6 py-20 text-center" data-testid="favorites-empty">
          <Heart className="mx-auto h-8 w-8 text-rose" strokeWidth={1.3} />
          <p className="mt-4 font-serif text-xl text-ink">Nenhum favorito ainda</p>
          <p className="mt-2 text-sm text-slate-soft">Toque no coração dos presentes que você amar para guardá-los aqui.</p>
          <Link to="/produtos" className="mt-8 inline-flex h-11 items-center rounded-full bg-blush px-6 text-sm text-night" data-testid="favorites-shop-link">
            Explorar presentes
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} loading={all.isLoading} error={all.isError} />
      )}
    </div>
  );
}
