import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { OrderLineIn } from "./types";

export interface CartItem extends OrderLineIn {
  key: string;
  slug: string;
  name: string;
  image: string;
  unit_price: number;
}

type NewCartItem = Omit<CartItem, "key">;

interface ShopState {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: NewCartItem, opts?: { silent?: boolean; open?: boolean }) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string, name?: string) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  coupon: string;
  setCoupon: (v: string) => void;
  cep: string;
  setCep: (v: string) => void;
  shippingMethod: string;
  setShippingMethod: (v: string) => void;
}

const ShopContext = createContext<ShopState | null>(null);

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

const lineKey = (i: NewCartItem) =>
  [i.product_id, JSON.stringify(i.options), i.personalization_name, i.personalization_message, i.upload_url].join("|");

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = usePersistent<CartItem[]>("gn_cart", []);
  const [favorites, setFavorites] = usePersistent<string[]>("gn_favs", []);
  const [coupon, setCoupon] = usePersistent<string>("gn_coupon", "");
  const [cep, setCep] = usePersistent<string>("gn_cep", "");
  const [shippingMethod, setShippingMethod] = usePersistent<string>("gn_ship", "pac");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const addToCart = useCallback<ShopState["addToCart"]>(
    (item, opts) => {
      const key = lineKey(item);
      setCart((prev) => {
        const found = prev.find((p) => p.key === key);
        if (found) return prev.map((p) => (p.key === key ? { ...p, quantity: Math.min(99, p.quantity + item.quantity) } : p));
        return [...prev, { ...item, key }];
      });
      if (!opts?.silent) toast.success("Adicionado à sacola", { description: item.name });
      if (opts?.open !== false) setCartOpen(true);
    },
    [setCart],
  );

  const value = useMemo<ShopState>(
    () => ({
      cart,
      cartCount: cart.reduce((s, i) => s + i.quantity, 0),
      cartSubtotal: cart.reduce((s, i) => s + i.quantity * i.unit_price, 0),
      addToCart,
      setQuantity: (key, quantity) =>
        setCart((prev) => prev.map((p) => (p.key === key ? { ...p, quantity: Math.max(1, Math.min(99, quantity)) } : p))),
      removeFromCart: (key) => setCart((prev) => prev.filter((p) => p.key !== key)),
      clearCart: () => setCart([]),
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite: (id, name) => {
        const has = favorites.includes(id);
        setFavorites((prev) => (has ? prev.filter((f) => f !== id) : prev.includes(id) ? prev : [...prev, id]));
        toast(has ? "Removido dos favoritos" : "Salvo nos favoritos", { description: name });
      },
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      coupon,
      setCoupon,
      cep,
      setCep,
      shippingMethod,
      setShippingMethod,
    }),
    [cart, favorites, cartOpen, searchOpen, coupon, cep, shippingMethod, addToCart, setCart, setFavorites, setCoupon, setCep, setShippingMethod],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
