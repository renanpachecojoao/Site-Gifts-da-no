/**
 * Modal de busca: buscas populares, atalhos de categorias e resultados ao digitar
 * (a partir de 2 letras). Enter leva para a página de resultados.
 */
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useShop } from "@/lib/store";
import { useCategories, useProducts } from "@/lib/queries";
import { finalPrice, money } from "@/lib/format";

const SUGGESTIONS = ["Ímã", "Chaveiro", "Espelhinho", "Abridor", "Casamento"];

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useShop();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const q = term.trim();
  const results = useProducts({ q, limit: 6 }, searchOpen && q.length >= 2);
  const cats = useCategories();

  const close = () => setSearchOpen(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q) return;
    close();
    navigate(`/produtos?q=${encodeURIComponent(q)}`);
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="top-[12%] max-w-[calc(100%-2rem)] translate-y-0 gap-0 rounded-3xl bg-ivory p-0 sm:max-w-2xl" data-testid="search-modal">
        <DialogTitle className="sr-only">Pesquisar presentes</DialogTitle>
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-6 py-5">
          <Search className="h-5 w-5 text-blush" strokeWidth={1.5} />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="O que você procura para presentear?"
            data-testid="search-modal-input"
            className="flex-1 bg-transparent font-serif text-xl text-ink outline-none placeholder:text-slate-soft/60"
          />
        </form>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {q.length < 2 ? (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-cocoa uppercase">Buscas populares</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTerm(s)}
                      data-testid={`search-suggestion-${s.toLowerCase()}`}
                      className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink transition-colors hover:border-blush"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-cocoa uppercase">Categorias</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {cats.data?.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/produtos?categoria=${c.slug}`}
                      onClick={close}
                      className="rounded-xl px-3 py-2 text-sm text-slate-soft transition-colors hover:bg-surface hover:text-blush"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : results.data && results.data.length > 0 ? (
            <ul className="space-y-1" data-testid="search-results">
              {results.data.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/produto/${p.slug}`}
                    onClick={close}
                    data-testid={`search-result-${p.slug}`}
                    className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-surface"
                  >
                    <img src={p.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <span className="flex-1">
                      <span className="block font-serif text-ink">{p.name}</span>
                      <span className="text-xs text-slate-soft">{p.short_description}</span>
                    </span>
                    <span className="text-sm font-semibold text-blush">{money(finalPrice(p))}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={submit}
                  data-testid="search-see-all-button"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blush"
                >
                  Ver todos os resultados <ArrowRight className="h-4 w-4" />
                </button>
              </li>
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-slate-soft" data-testid="search-no-results">
              {results.isFetching ? "Buscando…" : `Nenhum presente encontrado para “${q}”.`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
