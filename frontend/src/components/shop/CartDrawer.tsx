import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useShop } from "@/lib/store";
import { useQuote } from "@/lib/queries";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

const FREE_FROM = 299;

export function CartDrawer() {
  const s = useShop();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState(s.coupon);
  const [cepInput, setCepInput] = useState(s.cep);
  const [cepError, setCepError] = useState("");

  const quote = useQuote(
    {
      items: s.cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      coupon: s.coupon || null,
      cep: s.cep || null,
      shipping_method: s.shippingMethod,
    },
    s.cartOpen && s.cart.length > 0,
  );
  const q = quote.data;
  const subtotal = q?.subtotal ?? s.cartSubtotal;
  const remaining = Math.max(0, FREE_FROM - subtotal);

  const applyCep = () => {
    const d = cepInput.replace(/\D/g, "");
    if (d.length !== 8) return setCepError("Digite um CEP com 8 números");
    setCepError("");
    s.setCep(d);
  };

  return (
    <Sheet open={s.cartOpen} onOpenChange={s.setCartOpen}>
      <SheetContent side="right" className="w-full gap-0 bg-ivory p-0 sm:max-w-md" data-testid="cart-drawer">
        <SheetHeader className="border-b border-line px-6 py-5">
          <SheetTitle className="font-serif text-2xl font-normal text-ink">Sua sacola</SheetTitle>
          <SheetDescription className="text-xs text-slate-soft">
            {s.cartCount} {s.cartCount === 1 ? "item" : "itens"} · embalagem para presente inclusa
          </SheetDescription>
        </SheetHeader>

        {s.cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center" data-testid="cart-empty">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-nude text-blush">
              <ShoppingBag className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <p className="font-serif text-xl text-ink">Sua sacola está vazia</p>
            <p className="text-sm text-slate-soft">Que tal começar pelos presentes mais amados?</p>
            <button
              type="button"
              data-testid="cart-empty-shop-button"
              onClick={() => {
                s.setCartOpen(false);
                navigate("/produtos");
              }}
              className="mt-2 h-11 rounded-full bg-blush px-6 text-sm font-medium text-night transition-[background-color,transform] hover:bg-blush-deep active:scale-[0.98]"
            >
              Explorar presentes
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="border-b border-line py-4">
                <p className="text-xs text-slate-soft" data-testid="cart-free-shipping-progress">
                  {remaining > 0 ? (
                    <>
                      Faltam <strong className="text-blush">{money(remaining)}</strong> para frete grátis (PAC)
                    </>
                  ) : (
                    <strong className="text-blush">Você ganhou frete grátis no PAC</strong>
                  )}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-champagne">
                  <div className="h-full rounded-full bg-blush transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / FREE_FROM) * 100)}%` }} />
                </div>
              </div>
              <ul className="divide-y divide-line">
                {s.cart.map((i) => (
                  <li key={i.key} className="flex gap-4 py-5" data-testid={`cart-item-${i.slug}`}>
                    <img src={i.image} alt={i.name} className="h-24 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-[15px] leading-snug text-ink">{i.name}</p>
                        <button
                          type="button"
                          aria-label="Remover item"
                          data-testid={`cart-item-remove-${i.slug}`}
                          onClick={() => s.removeFromCart(i.key)}
                          className="text-slate-soft transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-soft">
                        {[...Object.values(i.options), i.personalization_name && `Nome: ${i.personalization_name}`, i.upload_url && "Com foto"]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-line bg-surface">
                          <button
                            type="button"
                            aria-label="Diminuir"
                            data-testid={`cart-item-decrease-${i.slug}`}
                            onClick={() => s.setQuantity(i.key, i.quantity - 1)}
                            className="grid h-8 w-8 place-items-center text-blush"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm" data-testid={`cart-item-qty-${i.slug}`}>
                            {i.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Aumentar"
                            data-testid={`cart-item-increase-${i.slug}`}
                            onClick={() => s.setQuantity(i.key, i.quantity + 1)}
                            className="grid h-8 w-8 place-items-center text-blush"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-blush">{money(i.unit_price * i.quantity)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 border-t border-line py-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-ink" htmlFor="cart-coupon">
                    <Tag className="h-3.5 w-3.5" /> Cupom de desconto
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="cart-coupon"
                      data-testid="cart-coupon-input"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Ex.: AFETO10"
                      className="h-10 rounded-full bg-surface px-4"
                    />
                    <button
                      type="button"
                      data-testid="cart-coupon-apply-button"
                      onClick={() => s.setCoupon(couponInput.trim())}
                      className="h-10 shrink-0 rounded-full border border-blush/40 px-4 text-xs font-medium text-blush transition-colors hover:bg-blush hover:text-night"
                    >
                      Aplicar
                    </button>
                  </div>
                  {s.coupon && q && (
                    <p data-testid="cart-coupon-message" className={cn("mt-1.5 text-xs", q.coupon_valid ? "text-emerald-300" : "text-destructive")}>
                      {q.coupon_message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-ink" htmlFor="cart-cep">
                    <Truck className="h-3.5 w-3.5" /> Calcular frete
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="cart-cep"
                      data-testid="cart-cep-input"
                      inputMode="numeric"
                      value={cepInput}
                      onChange={(e) => setCepInput(e.target.value)}
                      placeholder="00000-000"
                      className="h-10 rounded-full bg-surface px-4"
                    />
                    <button
                      type="button"
                      data-testid="cart-cep-calc-button"
                      onClick={applyCep}
                      className="h-10 shrink-0 rounded-full border border-blush/40 px-4 text-xs font-medium text-blush transition-colors hover:bg-blush hover:text-night"
                    >
                      Calcular
                    </button>
                  </div>
                  {cepError && <p className="mt-1.5 text-xs text-destructive">{cepError}</p>}
                  {q && q.shipping_options.length > 0 && (
                    <div className="mt-3 space-y-2" data-testid="cart-shipping-options">
                      {q.shipping_options.map((o) => (
                        <label
                          key={o.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border bg-surface px-4 py-3 text-xs transition-colors",
                            q.shipping_method === o.id ? "border-blush" : "border-line hover:border-blush/30",
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="ship"
                              className="accent-[#f4cccc]"
                              data-testid={`cart-shipping-${o.id}`}
                              checked={q.shipping_method === o.id}
                              onChange={() => s.setShippingMethod(o.id)}
                            />
                            <span>
                              <strong className="font-medium text-ink">{o.name}</strong>
                              <span className="block text-slate-soft">{o.days}</span>
                            </span>
                          </span>
                          <span className="font-semibold text-blush">{o.price === 0 ? "Grátis" : money(o.price)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-surface px-6 py-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-soft">
                  <dt>Subtotal</dt>
                  <dd data-testid="cart-subtotal">{money(subtotal)}</dd>
                </div>
                {q && q.discount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <dt>Desconto</dt>
                    <dd data-testid="cart-discount">- {money(q.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-slate-soft">
                  <dt>Frete</dt>
                  <dd data-testid="cart-shipping">{q && s.cep ? (q.shipping === 0 ? "Grátis" : money(q.shipping)) : "Calcule acima"}</dd>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold text-ink">
                  <dt>Total</dt>
                  <dd data-testid="cart-total">{money(q?.total ?? subtotal)}</dd>
                </div>
              </dl>
              <button
                type="button"
                data-testid="cart-checkout-button"
                onClick={() => {
                  s.setCartOpen(false);
                  navigate("/checkout");
                }}
                className="mt-4 h-12 w-full rounded-full bg-blush text-sm font-medium tracking-wide text-night transition-[background-color,transform] duration-300 hover:bg-blush-deep active:scale-[0.98]"
              >
                Finalizar compra
              </button>
              <button
                type="button"
                data-testid="cart-continue-button"
                onClick={() => s.setCartOpen(false)}
                className="mt-2 w-full py-2 text-xs text-slate-soft underline-offset-4 hover:underline"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
