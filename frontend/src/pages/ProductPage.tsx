import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Heart, ImagePlus, Minus, PackageCheck, Plus, ShieldCheck, Star, Truck, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, ApiError } from "@/lib/api";
import { useProduct, useQuote, useRelated, useReviews } from "@/lib/queries";
import { useShop } from "@/lib/store";
import { discountPct, finalPrice, installmentsText, money, pixPrice } from "@/lib/format";
import type { Review, UploadOut } from "@/lib/types";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductGrid } from "@/components/shop/ProductCard";
import { SectionHeading, Stars, container } from "@/components/shop/primitives";
import { cn } from "@/lib/utils";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = useProduct(slug);
  const related = useRelated(slug);
  const reviews = useReviews(slug);
  const shop = useShop();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const p = product.data;
  const [options, setOptions] = useState<Record<string, string>>({});
  const [pname, setPname] = useState("");
  const [pmsg, setPmsg] = useState("");
  const [upload, setUpload] = useState<UploadOut | null>(null);
  const [qty, setQty] = useState(1);
  const [cep, setCep] = useState("");
  const [cepQuery, setCepQuery] = useState("");

  useEffect(() => {
    if (!p) return;
    document.title = `${p.name} · Gifts da No`;
    const init: Record<string, string> = {};
    p.personalization.options.forEach((g) => (init[g.name] = g.values[0]));
    setOptions(init);
    setPname("");
    setPmsg("");
    setUpload(null);
    setQty(1);
  }, [p]);

  const shipQuote = useQuote(
    { items: p ? [{ product_id: p.id, quantity: qty }] : [], cep: cepQuery },
    !!p && cepQuery.length === 8,
  );

  const uploadM = useMutation({
    mutationFn: async (file: File) => apiPost<UploadOut>("/uploads", { filename: file.name, data_url: await readAsDataUrl(file) }),
    onSuccess: (r) => {
      setUpload(r);
      toast.success("Imagem enviada");
    },
    onError: (e) =>
      toast.error(e instanceof ApiError && e.body && typeof e.body === "object" && "detail" in e.body ? String((e.body as { detail: unknown }).detail) : "Falha no envio da imagem"),
  });

  if (product.isError)
    return (
      <div className={`${container} py-32 text-center`} data-testid="product-not-found">
        <h1 className="text-4xl text-ink">Produto não encontrado</h1>
        <Link to="/produtos" className="mt-6 inline-block text-sm text-blush underline underline-offset-4">
          Ver todos os presentes
        </Link>
      </div>
    );

  if (!p)
    return (
      <div className={`${container} grid gap-10 py-12 lg:grid-cols-2`}>
        <div className="aspect-[4/5] animate-pulse rounded-3xl bg-nude" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 animate-pulse rounded bg-nude" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-nude" />
        </div>
      </div>
    );

  const price = finalPrice(p);
  const pct = discountPct(p);
  const fav = shop.isFavorite(p.id);
  const pers = p.personalization;

  const add = (buyNow: boolean) => {
    shop.addToCart(
      {
        product_id: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images[0],
        unit_price: price,
        quantity: qty,
        options,
        personalization_name: pname.trim(),
        personalization_message: pmsg.trim(),
        upload_url: upload?.url ?? "",
      },
      { open: !buyNow, silent: buyNow },
    );
    if (buyNow) navigate("/checkout");
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadM.mutate(f);
    e.target.value = "";
  };

  return (
    <div className="pb-20">
      <div className={`${container} py-6`}>
        <nav className="text-xs text-slate-soft" aria-label="breadcrumb">
          <Link to="/" className="hover:text-blush">Início</Link>
          <span className="mx-1.5">/</span>
          <Link to="/produtos" className="hover:text-blush">Presentes</Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{p.name}</span>
        </nav>
      </div>

      <div className={`${container} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <ProductGallery images={p.images} name={p.name} />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex items-center gap-2">
            {p.badge && (
              <span className="rounded-full bg-blush px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-night uppercase">{p.badge}</span>
            )}
            <span className="text-[11px] text-slate-soft">SKU {p.sku}</span>
          </div>
          <h1 className="mt-4 text-4xl leading-[1.1] font-normal tracking-tight text-ink sm:text-[44px]" data-testid="product-title">
            {p.name}
          </h1>
          <a href="#avaliacoes" className="mt-3 inline-flex items-center gap-2 text-sm text-slate-soft hover:text-blush" data-testid="product-rating">
            <Stars value={p.rating} /> {p.rating.toFixed(1)} · {p.reviews_count} avaliações
          </a>
          <p className="mt-5 text-base leading-relaxed text-slate-soft">{p.short_description}</p>

          <div className="mt-7 rounded-2xl border border-line bg-surface p-5" data-testid="product-price-block">
            <div className="flex flex-wrap items-baseline gap-3">
              {p.promo_price && <span className="text-base text-slate-soft line-through">{money(p.price)}</span>}
              <span className="text-3xl font-semibold text-blush" data-testid="product-price">{money(price)}</span>
              {pct > 0 && <span className="rounded-full bg-rose/10 px-2.5 py-1 text-xs font-semibold text-rose">-{pct}%</span>}
            </div>
            <p className="mt-1 text-sm text-slate-soft">{installmentsText(price)}</p>
            <p className="mt-1 text-sm text-emerald-300">{money(pixPrice(price))} no Pix (5% off)</p>
          </div>

          {pers.options.map((g) => (
            <fieldset key={g.name} className="mt-7">
              <legend className="mb-3 text-sm font-medium text-ink">
                {g.name}: <span className="font-normal text-slate-soft">{options[g.name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {g.values.map((v) => (
                  <button
                    key={v}
                    type="button"
                    data-testid={`product-option-${v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}`}
                    onClick={() => setOptions((o) => ({ ...o, [g.name]: v }))}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition-[border-color,background-color,color] duration-300",
                      options[g.name] === v ? "border-blush bg-blush text-night" : "border-line bg-surface text-ink hover:border-blush/40",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          {(pers.allow_name || pers.allow_message || pers.allow_upload) && (
            <div className="mt-8 rounded-2xl bg-nude/70 p-5" data-testid="product-personalization">
              <p className="font-serif text-lg text-ink">Personalização</p>
              <p className="mb-4 text-xs text-slate-soft">Enviamos uma prévia pelo WhatsApp antes de produzir.</p>
              {pers.allow_name && (
                <div className="mb-4">
                  <label htmlFor="pname" className="mb-1.5 block text-xs font-medium text-ink">
                    Nome ou iniciais <span className="text-slate-soft">({pname.length}/{pers.name_max})</span>
                  </label>
                  <Input
                    id="pname"
                    data-testid="product-personalization-name"
                    value={pname}
                    maxLength={pers.name_max}
                    onChange={(e) => setPname(e.target.value)}
                    placeholder="Ex.: Helena"
                    className="h-11 rounded-xl bg-surface"
                  />
                </div>
              )}
              {pers.allow_message && (
                <div className="mb-4">
                  <label htmlFor="pmsg" className="mb-1.5 block text-xs font-medium text-ink">
                    Mensagem <span className="text-slate-soft">({pmsg.length}/{pers.message_max})</span>
                  </label>
                  <Textarea
                    id="pmsg"
                    data-testid="product-personalization-message"
                    value={pmsg}
                    maxLength={pers.message_max}
                    onChange={(e) => setPmsg(e.target.value)}
                    placeholder="Escreva algo especial para quem vai receber"
                    className="min-h-20 rounded-xl bg-surface"
                  />
                </div>
              )}
              {pers.allow_upload && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink">Foto para personalização</p>
                  {upload ? (
                    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2" data-testid="product-upload-preview">
                      <img src={upload.url} alt="Imagem enviada" className="h-14 w-14 rounded-lg object-cover" />
                      <span className="flex-1 text-xs text-slate-soft">Imagem anexada</span>
                      <button type="button" onClick={() => setUpload(null)} aria-label="Remover imagem" data-testid="product-upload-remove" className="p-2 text-slate-soft hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blush/40 bg-surface py-5 text-sm text-blush transition-colors hover:border-blush" data-testid="product-upload-dropzone">
                      <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
                      {uploadM.isPending ? "Enviando…" : "Enviar imagem (PNG, JPG · até 5 MB)"}
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onFile} data-testid="product-upload-input" />
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-12 items-center rounded-full border border-line bg-surface">
              <button type="button" aria-label="Diminuir quantidade" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-11 place-items-center text-blush" data-testid="product-qty-decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium" data-testid="product-qty">{qty}</span>
              <button type="button" aria-label="Aumentar quantidade" onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="grid h-12 w-11 place-items-center text-blush" data-testid="product-qty-increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => shop.toggleFavorite(p.id, p.name)}
              aria-pressed={fav}
              aria-label="Favoritar"
              data-testid="product-favorite-button"
              className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-blush transition-colors hover:border-blush"
            >
              <Heart className={cn("h-5 w-5", fav && "fill-rose text-rose")} strokeWidth={1.5} />
            </button>
            <span className="text-xs text-slate-soft">{p.stock > 0 ? `${p.stock} em estoque` : "Sob encomenda"}</span>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => add(true)}
              data-testid="product-buy-now-button"
              className="h-14 rounded-full bg-blush text-sm font-medium tracking-wide text-night transition-[background-color,transform] duration-300 hover:bg-blush-deep active:scale-[0.99]"
            >
              Comprar agora
            </button>
            <button
              type="button"
              onClick={() => add(false)}
              data-testid="product-add-to-cart-button"
              className="h-14 rounded-full border border-blush/40 text-sm font-medium text-blush transition-[background-color,border-color] duration-300 hover:border-blush hover:bg-surface"
            >
              Adicionar ao carrinho
            </button>
          </div>

          <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
            <div className="flex items-start gap-3 p-4">
              <Clock className="mt-0.5 h-5 w-5 text-cocoa" strokeWidth={1.4} />
              <div>
                <p className="text-sm font-medium text-ink">Prazo de produção</p>
                <p className="text-xs text-slate-soft" data-testid="product-production-time">{p.production_time} + prazo de entrega</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-cocoa" strokeWidth={1.4} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">Calcule a entrega</p>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      const d = cep.replace(/\D/g, "");
                      if (d.length !== 8) return toast.error("Digite um CEP com 8 números");
                      setCepQuery(d);
                    }}
                  >
                    <Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" className="h-10 rounded-full px-4" data-testid="product-cep-input" />
                    <button type="submit" className="h-10 rounded-full border border-blush/40 px-4 text-xs font-medium text-blush hover:bg-blush hover:text-night" data-testid="product-cep-button">
                      Calcular
                    </button>
                  </form>
                  {shipQuote.data && cepQuery && (
                    <ul className="mt-3 space-y-1.5 text-xs" data-testid="product-shipping-options">
                      {shipQuote.data.shipping_options.map((o) => (
                        <li key={o.id} className="flex justify-between">
                          <span className="text-slate-soft">{o.name} · {o.days}</span>
                          <strong className="font-medium text-blush">{o.price === 0 ? "Grátis" : money(o.price)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 p-4 text-xs text-slate-soft">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-cocoa" strokeWidth={1.4} /> Compra segura</span>
              <span className="flex items-center gap-1.5"><PackageCheck className="h-4 w-4 text-cocoa" strokeWidth={1.4} /> Embalagem para presente</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${container} mt-20`}>
        <Tabs defaultValue="descricao" className="gap-8">
          <TabsList variant="line" className="w-full justify-start gap-6 border-b border-line">
            <TabsTrigger value="descricao" data-testid="product-tab-description">Descrição</TabsTrigger>
            <TabsTrigger value="materiais" data-testid="product-tab-materials">Materiais e dimensões</TabsTrigger>
            <TabsTrigger value="cuidados" data-testid="product-tab-care">Cuidados</TabsTrigger>
          </TabsList>
          <TabsContent value="descricao" className="max-w-3xl text-base leading-relaxed text-slate-soft">{p.description}</TabsContent>
          <TabsContent value="materiais" className="grid max-w-3xl gap-6 sm:grid-cols-2">
            <div>
              <p className="font-serif text-lg text-ink">Materiais</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-soft">{p.materials}</p>
            </div>
            <div>
              <p className="font-serif text-lg text-ink">Dimensões</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-soft">{p.dimensions}</p>
            </div>
          </TabsContent>
          <TabsContent value="cuidados" className="max-w-3xl text-sm leading-relaxed text-slate-soft">{p.care}</TabsContent>
        </Tabs>
      </div>

      <ReviewsBlock slug={slug} reviews={reviews.data} rating={p.rating} count={p.reviews_count} onCreated={() => {
        qc.invalidateQueries({ queryKey: ["reviews", slug] });
        qc.invalidateQueries({ queryKey: ["product", slug] });
      }} />

      <section className={`${container} mt-24`}>
        <SectionHeading overline="Você também pode amar" title="Produtos relacionados" />
        <ProductGrid products={related.data} loading={related.isLoading} error={related.isError} />
      </section>
    </div>
  );
}

function ReviewsBlock({ slug, reviews, rating, count, onCreated }: {
  slug: string;
  reviews?: Review[];
  rating: number;
  count: number;
  onCreated: () => void;
}) {
  const [author, setAuthor] = useState("");
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const m = useMutation({
    mutationFn: () => apiPost<Review>(`/products/${slug}/reviews`, { author, rating: stars, comment }),
    onSuccess: () => {
      toast.success("Obrigada pela sua avaliação!");
      setAuthor("");
      setComment("");
      setStars(5);
      onCreated();
    },
    onError: () => toast.error("Preencha seu nome e um comentário"),
  });

  return (
    <section id="avaliacoes" className={`${container} mt-24 scroll-mt-28`} data-testid="product-reviews">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-cocoa uppercase">Avaliações</p>
          <p className="mt-3 font-serif text-6xl text-blush">{rating.toFixed(1)}</p>
          <Stars value={rating} size={16} className="mt-2" />
          <p className="mt-2 text-sm text-slate-soft">{count} avaliações</p>
          <form
            className="mt-8 space-y-3 rounded-2xl border border-line bg-surface p-5"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
            data-testid="review-form"
          >
            <p className="font-serif text-lg text-ink">Avalie este presente</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Nota">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} estrelas`} data-testid={`review-star-${n}`} className="text-cocoa">
                  <Star className={cn("h-5 w-5 transition-colors", n <= stars ? "fill-cocoa" : "fill-transparent text-cocoa/40")} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Seu nome" className="h-10 rounded-xl" data-testid="review-author-input" />
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi a experiência" className="min-h-20 rounded-xl" data-testid="review-comment-input" />
            <button type="submit" disabled={m.isPending} className="h-11 w-full rounded-full bg-blush text-sm font-medium text-night transition-colors hover:bg-blush-deep disabled:opacity-60" data-testid="review-submit-button">
              {m.isPending ? "Enviando…" : "Publicar avaliação"}
            </button>
          </form>
        </div>
        <ul className="divide-y divide-line lg:col-span-8">
          {reviews?.map((r) => (
            <li key={r.id} className="py-6 first:pt-0" data-testid={`review-item-${r.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-champagne font-serif text-blush">{r.author[0]}</span>
                  <div>
                    <p className="text-sm font-medium text-ink">{r.author}</p>
                    <Stars value={r.rating} size={12} />
                  </div>
                </div>
                <span className="text-xs text-slate-soft">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  {r.verified && " · Compra verificada"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-soft">{r.comment}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
