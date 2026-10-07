/**
 * Checkout em 5 etapas: Dados pessoais, Endereço, Entrega, Pagamento e Revisão.
 * - validate(): confere os campos de cada etapa antes de avançar.
 * - submit(): envia o pedido para /api/orders. PAGAMENTO SIMULADO (nenhum valor é cobrado).
 * - Resumo do pedido fixo ao lado. Confirmation: tela final com número do pedido e Pix fictício.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, CheckCircle2, Copy, CreditCard, Lock, QrCode, ShieldCheck } from "lucide-react";
import { SiPix } from "@icons-pack/react-simple-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost, ApiError } from "@/lib/api";
import { useMe, useQuote } from "@/lib/queries";
import { useShop } from "@/lib/store";
import { money, pixPrice } from "@/lib/format";
import type { Address, Customer, Order, OrderCreate, PaymentMethod } from "@/lib/types";
import { container } from "@/components/shop/primitives";
import { cn } from "@/lib/utils";

const STEPS = ["Dados pessoais", "Endereço", "Entrega", "Pagamento", "Revisão"];
const digits = (s: string) => s.replace(/\D/g, "");

function Field({ id, label, value, onChange, placeholder, className, inputMode, maxLength }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: "numeric" | "email" | "tel" | "text";
  maxLength?: number;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-xs font-medium text-ink">
        {label}
      </Label>
      <Input
        id={id}
        data-testid={`checkout-${id}-input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-11 rounded-xl bg-surface"
      />
    </div>
  );
}

export default function Checkout() {
  const shop = useShop();
  const me = useMe();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer>({ name: "", email: "", phone: "", cpf: "" });
  const [address, setAddress] = useState<Address>({ cep: shop.cep, street: "", number: "", complement: "", district: "", city: "", state: "" });
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState("1");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    document.title = "Checkout · Gifts da No";
  }, []);

  useEffect(() => {
    const u = me.data;
    if (u) setCustomer((c) => ({ ...c, name: c.name || u.name || "", email: c.email || u.email }));
  }, [me.data]);

  const cep = digits(address.cep);
  const quote = useQuote(
    {
      items: shop.cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      coupon: shop.coupon || null,
      cep: cep.length === 8 ? cep : null,
      shipping_method: shop.shippingMethod,
    },
    shop.cart.length > 0,
  );
  const q = quote.data;
  const total = q ? (payment === "pix" ? pixPrice(q.total) : q.total) : shop.cartSubtotal;

  const place = useMutation({
    mutationFn: (body: OrderCreate) => apiPost<Order>("/orders", body),
    onSuccess: (o) => {
      setOrder(o);
      shop.clearCart();
      shop.setCoupon("");
      window.scrollTo({ top: 0 });
    },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 422 ? "Revise os dados informados" : "Não foi possível concluir o pedido"),
  });

  const validate = (s: number) => {
    if (s === 0) {
      if (customer.name.trim().length < 3) return "Informe seu nome completo";
      if (!/^\S+@\S+\.\S+$/.test(customer.email)) return "Informe um e-mail válido";
      if (digits(customer.phone).length < 10) return "Informe um telefone com DDD";
      if (digits(customer.cpf).length !== 11) return "CPF deve ter 11 números";
    }
    if (s === 1) {
      if (cep.length !== 8) return "CEP deve ter 8 números";
      if (!address.street || !address.number || !address.district || !address.city) return "Preencha o endereço completo";
      if (address.state.trim().length !== 2) return "UF com 2 letras (ex.: SP)";
    }
    if (s === 2 && !q?.shipping_method) return "Selecione uma forma de entrega";
    if (s === 3 && payment !== "pix") {
      if (digits(card.number).length < 13) return "Número do cartão inválido";
      if (card.name.trim().length < 3) return "Nome impresso no cartão";
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) return "Validade no formato MM/AA";
      if (digits(card.cvv).length < 3) return "CVV inválido";
    }
    return "";
  };

  const next = () => {
    const msg = validate(step);
    setError(msg);
    if (!msg) setStep((s) => Math.min(4, s + 1));
  };

  const submit = () =>
    place.mutate({
      customer: { ...customer, cpf: digits(customer.cpf) },
      address: { ...address, cep, state: address.state.toUpperCase() },
      items: shop.cart.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        options: i.options,
        personalization_name: i.personalization_name,
        personalization_message: i.personalization_message,
        upload_url: i.upload_url,
      })),
      coupon: shop.coupon || null,
      shipping_method: q?.shipping_method ?? shop.shippingMethod,
      payment_method: payment,
      installments: payment === "credit" ? Number(installments) : 1,
    });

  if (order) return <Confirmation order={order} />;

  if (shop.cart.length === 0)
    return (
      <div className={`${container} py-32 text-center`} data-testid="checkout-empty">
        <h1 className="text-4xl text-ink">Sua sacola está vazia</h1>
        <p className="mt-3 text-slate-soft">Escolha um presente para continuar.</p>
        <Link to="/produtos" className="mt-8 inline-flex h-12 items-center rounded-full bg-blush px-8 text-sm text-night" data-testid="checkout-empty-shop-link">
          Ver presentes
        </Link>
      </div>
    );

  const setA = (k: keyof Address) => (v: string) => setAddress((a) => ({ ...a, [k]: v }));
  const setC = (k: keyof Customer) => (v: string) => setCustomer((c) => ({ ...c, [k]: v }));

  return (
    <div className={`${container} py-10 sm:py-14`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-normal text-ink sm:text-4xl">Finalizar compra</h1>
        <span className="hidden items-center gap-2 text-xs text-slate-soft sm:flex">
          <Lock className="h-3.5 w-3.5" /> Ambiente seguro
        </span>
      </div>

      <ol className="mt-8 flex items-center gap-2 overflow-x-auto pb-2" data-testid="checkout-stepper">
        {STEPS.map((s, i) => (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              data-testid={`checkout-step-${i + 1}`}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors",
                i === step ? "bg-blush text-night" : i < step ? "text-blush hover:bg-champagne" : "text-slate-soft/70",
              )}
            >
              <span className={cn("grid h-5 w-5 place-items-center rounded-full border text-[10px]", i === step ? "border-ivory/40" : "border-current")}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-5 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8" data-testid={`checkout-panel-${step + 1}`}>
            <h2 className="mb-6 font-serif text-2xl text-ink">{STEPS[step]}</h2>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Nome completo" value={customer.name} onChange={setC("name")} className="sm:col-span-2" />
                <Field id="email" label="E-mail" value={customer.email} onChange={setC("email")} inputMode="email" />
                <Field id="phone" label="Celular / WhatsApp" value={customer.phone} onChange={setC("phone")} inputMode="tel" placeholder="(11) 99999-9999" />
                <Field id="cpf" label="CPF" value={customer.cpf} onChange={setC("cpf")} inputMode="numeric" placeholder="000.000.000-00" maxLength={14} />
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-6">
                <Field id="cep" label="CEP" value={address.cep} onChange={setA("cep")} inputMode="numeric" placeholder="00000-000" className="sm:col-span-2" maxLength={9} />
                <Field id="street" label="Rua / Avenida" value={address.street} onChange={setA("street")} className="sm:col-span-4" />
                <Field id="number" label="Número" value={address.number} onChange={setA("number")} className="sm:col-span-2" />
                <Field id="complement" label="Complemento (opcional)" value={address.complement} onChange={setA("complement")} className="sm:col-span-4" />
                <Field id="district" label="Bairro" value={address.district} onChange={setA("district")} className="sm:col-span-2" />
                <Field id="city" label="Cidade" value={address.city} onChange={setA("city")} className="sm:col-span-3" />
                <Field id="state" label="UF" value={address.state} onChange={(v) => setA("state")(v.toUpperCase())} maxLength={2} className="sm:col-span-1" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3" data-testid="checkout-shipping-options">
                {q?.shipping_options.map((o) => (
                  <label
                    key={o.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition-colors",
                      q.shipping_method === o.id ? "border-blush bg-ivory" : "border-line hover:border-blush/30",
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="checkout-ship"
                        className="accent-[#f4cccc]"
                        checked={q.shipping_method === o.id}
                        onChange={() => shop.setShippingMethod(o.id)}
                        data-testid={`checkout-shipping-${o.id}`}
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink">{o.name}</span>
                        <span className="text-xs text-slate-soft">{o.days} após a produção</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-blush">{o.price === 0 ? "Grátis" : money(o.price)}</span>
                  </label>
                ))}
                <p className="pt-2 text-xs text-slate-soft">Itens personalizados têm prazo de produção somado ao prazo de entrega.</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
                  {([
                    { id: "pix", label: "Pix", hint: "5% de desconto", icon: <SiPix size={16} color="currentColor" /> },
                    { id: "credit", label: "Cartão de crédito", hint: "Até 6x sem juros", icon: <CreditCard className="h-4 w-4" /> },
                    { id: "debit", label: "Cartão de débito", hint: "Aprovação imediata", icon: <CreditCard className="h-4 w-4" /> },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayment(m.id)}
                      data-testid={`checkout-payment-${m.id}`}
                      aria-pressed={payment === m.id}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors",
                        payment === m.id ? "border-blush bg-ivory" : "border-line hover:border-blush/30",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        {m.icon} {m.label}
                      </span>
                      <span className="mt-1 block text-xs text-slate-soft">{m.hint}</span>
                    </button>
                  ))}
                </div>
                {payment === "pix" ? (
                  <div className="mt-6 flex items-center gap-4 rounded-2xl bg-nude/60 p-5 text-sm text-slate-soft">
                    <QrCode className="h-10 w-10 text-blush" strokeWidth={1.2} />
                    O QR Code e o código copia e cola serão gerados após a confirmação. Pagamento aprovado em segundos.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <Field id="card-number" label="Número do cartão" value={card.number} onChange={(v) => setCard((c) => ({ ...c, number: v }))} inputMode="numeric" placeholder="0000 0000 0000 0000" className="sm:col-span-4" maxLength={19} />
                    <Field id="card-name" label="Nome impresso" value={card.name} onChange={(v) => setCard((c) => ({ ...c, name: v }))} className="sm:col-span-2" />
                    <Field id="card-exp" label="Validade" value={card.exp} onChange={(v) => setCard((c) => ({ ...c, exp: v }))} placeholder="MM/AA" maxLength={5} />
                    <Field id="card-cvv" label="CVV" value={card.cvv} onChange={(v) => setCard((c) => ({ ...c, cvv: v }))} inputMode="numeric" maxLength={4} />
                    {payment === "credit" && q && (
                      <div className="sm:col-span-4">
                        <Label className="mb-1.5 text-xs font-medium text-ink">Parcelamento</Label>
                        <Select value={installments} onValueChange={(v: string) => setInstallments(v)}>
                          <SelectTrigger className="h-11 w-full rounded-xl bg-surface" data-testid="checkout-installments-select">
                            <SelectValue>{(v) => `${v}x de ${money(q.total / Number(v))} sem juros`}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <SelectItem key={n} value={String(n)} data-testid={`checkout-installments-${n}`}>
                                {n}x de {money(q.total / n)} sem juros
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-soft sm:col-span-4">Ambiente de demonstração: nenhum valor será cobrado.</p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 text-sm" data-testid="checkout-review">
                {[
                  { t: "Dados pessoais", s: 0, v: `${customer.name} · ${customer.email} · ${customer.phone}` },
                  { t: "Endereço", s: 1, v: `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""} · ${address.district} · ${address.city}/${address.state} · CEP ${cep}` },
                  { t: "Entrega", s: 2, v: q?.shipping_options.find((o) => o.id === q.shipping_method)?.name ?? "" },
                  { t: "Pagamento", s: 3, v: payment === "pix" ? "Pix (5% off)" : payment === "credit" ? `Crédito em ${installments}x sem juros` : "Débito" },
                ].map((r) => (
                  <div key={r.t} className="flex items-start justify-between gap-4 border-b border-line pb-4">
                    <div>
                      <p className="font-medium text-ink">{r.t}</p>
                      <p className="mt-1 text-slate-soft">{r.v}</p>
                    </div>
                    <button type="button" onClick={() => setStep(r.s)} className="text-xs text-blush underline underline-offset-4" data-testid={`checkout-review-edit-${r.s + 1}`}>
                      Editar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="mt-5 text-sm text-destructive" data-testid="checkout-error">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm text-slate-soft hover:text-blush" data-testid="checkout-back-button">
                  Voltar
                </button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  data-testid="checkout-next-button"
                  className="h-12 rounded-full bg-blush px-8 text-sm font-medium text-night transition-[background-color,transform] hover:bg-blush-deep active:scale-[0.98]"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={place.isPending}
                  data-testid="checkout-place-order-button"
                  className="h-12 rounded-full bg-blush px-8 text-sm font-medium text-night transition-[background-color,transform] hover:bg-blush-deep active:scale-[0.98] disabled:opacity-60"
                >
                  {place.isPending ? "Processando…" : `Confirmar pedido · ${money(total)}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-24" data-testid="checkout-summary">
            <p className="font-serif text-xl text-ink">Resumo do pedido</p>
            <ul className="mt-5 space-y-4">
              {shop.cart.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <div className="relative">
                    <img src={i.image} alt="" className="h-16 w-14 rounded-lg object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-blush text-[10px] text-night">{i.quantity}</span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-ink">{i.name}</p>
                    <p className="text-xs text-slate-soft">{[...Object.values(i.options), i.personalization_name].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="text-sm text-ink">{money(i.unit_price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between text-slate-soft"><dt>Subtotal</dt><dd>{money(q?.subtotal ?? shop.cartSubtotal)}</dd></div>
              {q && q.discount > 0 && <div className="flex justify-between text-emerald-300"><dt>Cupom {q.coupon}</dt><dd>- {money(q.discount)}</dd></div>}
              <div className="flex justify-between text-slate-soft"><dt>Frete</dt><dd data-testid="checkout-summary-shipping">{q?.shipping_method ? (q.shipping === 0 ? "Grátis" : money(q.shipping)) : "—"}</dd></div>
              {payment === "pix" && q && <div className="flex justify-between text-emerald-300"><dt>Desconto Pix (5%)</dt><dd>- {money(q.total - pixPrice(q.total))}</dd></div>}
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink"><dt>Total</dt><dd data-testid="checkout-summary-total">{money(total)}</dd></div>
            </dl>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-soft">
              <ShieldCheck className="h-4 w-4 text-cocoa" strokeWidth={1.4} /> Seus dados são protegidos com criptografia.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Confirmation({ order }: { order: Order }) {
  return (
    <div className={`${container} max-w-2xl py-16 text-center sm:py-24`} data-testid="order-confirmation">
      <CheckCircle2 className="mx-auto h-14 w-14 text-blush" strokeWidth={1.2} />
      <p className="mt-6 text-[11px] font-semibold tracking-[0.24em] text-cocoa uppercase">Pedido confirmado</p>
      <h1 className="mt-3 text-4xl font-normal text-ink sm:text-5xl">Obrigada, {order.customer.name.split(" ")[0]}!</h1>
      <p className="mt-4 text-slate-soft">
        Seu pedido <strong className="text-blush" data-testid="order-number">#{order.number}</strong> foi recebido. Enviamos os detalhes para {order.customer.email}.
      </p>
      <div className="mt-10 rounded-3xl border border-line bg-surface p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-slate-soft">Status</span>
          <span className="font-medium text-ink" data-testid="order-status">{order.status}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-slate-soft">Total</span>
          <span className="font-semibold text-blush" data-testid="order-total">{money(order.total)}</span>
        </div>
        {order.pix_code && (
          <div className="mt-6 border-t border-line pt-6 text-center">
            <div className="mx-auto grid h-40 w-40 grid-cols-8 gap-0.5 rounded-xl bg-surface p-2 ring-1 ring-line" aria-label="QR Code Pix (demonstração)">
              {Array.from({ length: 64 }).map((_, i) => (
                <span key={i} className={(order.number.charCodeAt(i % order.number.length) * (i + 3)) % 3 ? "bg-blush" : "bg-transparent"} />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-soft">Pix copia e cola (demonstração)</p>
            <button
              type="button"
              data-testid="order-pix-copy-button"
              onClick={() => {
                navigator.clipboard?.writeText(order.pix_code ?? "");
                toast.success("Código Pix copiado");
              }}
              className="mt-2 inline-flex max-w-full items-center gap-2 truncate rounded-full border border-line px-4 py-2 text-xs text-blush hover:border-blush"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{order.pix_code}</span>
            </button>
          </div>
        )}
      </div>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/produtos" className="inline-flex h-12 items-center justify-center rounded-full bg-blush px-8 text-sm text-night" data-testid="order-continue-shopping">
          Continuar comprando
        </Link>
        <Link to="/conta" className="inline-flex h-12 items-center justify-center rounded-full border border-blush/40 px-8 text-sm text-blush" data-testid="order-my-account">
          Meus pedidos
        </Link>
      </div>
    </div>
  );
}
