/**
 * Funções de formatação e constantes da loja.
 * - money(): formata em reais (R$).
 * - finalPrice(): preço promocional se houver, senão o preço normal.
 * - discountPct(): percentual de desconto.
 * - installmentsText(): texto de parcelamento (até 6x, parcela mínima ~R$ 30).
 * - pixPrice(): preço com 5% de desconto no Pix.
 * - WHATSAPP_URL / INSTAGRAM_URL: troque pelos contatos reais da loja.
 */
import type { Product } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const money = (v: number) => brl.format(v);

export const finalPrice = (p: Product) => p.promo_price ?? p.price;

export const discountPct = (p: Product) =>
  p.promo_price ? Math.round((1 - p.promo_price / p.price) * 100) : 0;

export const MAX_INSTALLMENTS = 6;

export const installmentsText = (value: number) => {
  const n = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(value / 30)));
  return n > 1 ? `ou ${n}x de ${money(value / n)} sem juros` : "à vista no cartão";
};

export const pixPrice = (value: number) => value * 0.95;

export const WHATSAPP_URL =
  "https://wa.me/5511999999999?text=" + encodeURIComponent("Olá! Vim pelo site da Gifts da No e gostaria de ajuda com um presente.");
export const INSTAGRAM_URL = "https://instagram.com/giftsdano";
