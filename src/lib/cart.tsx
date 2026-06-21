import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProducts, usePacks } from "@/data/products";

export type CartItemKind = "book" | "pack" | "custom-pack";

export type CustomPackData = {
  tierSize: number;
  tierLabel: string;
  bookSlugs: string[];
  bookTitles: string[];
  perk: string;
  price: number;
  image: string;
};

export type CartItem = {
  slug: string;
  kind: CartItemKind;
  quantity: number;
  customPack?: CustomPackData;
};

export type CartItemInfo = {
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  kind: CartItemKind;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (slug: string, kind: CartItemKind, quantity?: number) => void;
  addCustomPack: (data: CustomPackData) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  getInfo: (item: CartItem) => CartItemInfo | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "coloragy-cart-v1";
const COOKIE_KEY = "coloragy_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(isValid);
    }
    const match = document.cookie.split("; ").find((c) => c.startsWith(COOKIE_KEY + "="));
    if (match) {
      const raw2 = decodeURIComponent(match.split("=")[1] ?? "");
      const parsed = JSON.parse(raw2);
      if (Array.isArray(parsed)) return parsed.filter(isValid);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function isValid(x: unknown): x is CartItem {
  if (!x || typeof x !== "object") return false;
  const v = x as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    (v.kind === "book" || v.kind === "pack" || v.kind === "custom-pack") &&
    typeof v.quantity === "number"
  );
}

function persist(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    const encoded = encodeURIComponent(JSON.stringify(items));
    document.cookie = `${COOKIE_KEY}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useProducts();
  const packs = usePacks();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) persist(items);
  }, [items, hydrated]);

  const getInfo = useCallback(
    (item: CartItem): CartItemInfo | null => {
      if (item.kind === "custom-pack" && item.customPack) {
        const cp = item.customPack;
        return {
          slug: item.slug,
          title: `Pack ${cp.tierLabel} · ${cp.tierSize} livres`,
          subtitle: cp.bookTitles.join(" · "),
          price: cp.price,
          image: cp.image,
          kind: "custom-pack",
        };
      }
      if (item.kind === "pack") {
        const p = packs.find((x) => x.slug === item.slug);
        if (!p) return null;
        return { slug: p.slug, title: p.title, subtitle: p.subtitle, price: p.price, image: p.image, kind: "pack" };
      }
      const p = products.find((x) => x.slug === item.slug);
      if (!p) return null;
      return { slug: p.slug, title: p.title, subtitle: p.tagline, price: p.price, image: p.image, kind: "book" };
    },
    [products, packs],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, it) => {
      const info = getInfo(it);
      return sum + (info ? info.price * it.quantity : 0);
    }, 0);
    const count = items.reduce((n, it) => n + it.quantity, 0);
    return {
      items,
      count,
      subtotal,
      getInfo,
      add: (slug, kind, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.slug === slug);
          if (existing) return prev.map((p) => (p.slug === slug ? { ...p, quantity: p.quantity + quantity } : p));
          return [...prev, { slug, kind, quantity }];
        }),
      addCustomPack: (data) =>
        setItems((prev) => {
          const slug = `custom-pack-${data.tierSize}-${Date.now()}`;
          return [...prev, { slug, kind: "custom-pack", quantity: 1, customPack: data }];
        }),
      remove: (slug) => setItems((prev) => prev.filter((p) => p.slug !== slug)),
      setQty: (slug, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((p) => p.slug !== slug)
            : prev.map((p) => (p.slug === slug ? { ...p, quantity: qty } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items, getInfo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
