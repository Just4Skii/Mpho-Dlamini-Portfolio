import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product } from "@/projects/kasicart/types";

interface CartContextType {
  items: CartItem[];
  saved: CartItem[];
  add: (product: Product, opts?: { color?: string; size?: string; variantId?: string; quantity?: number }) => void;
  remove: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  saveForLater: (index: number) => void;
  moveToCart: (index: number) => void;
  removeSaved: (index: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const Ctx = createContext<CartContextType | null>(null);

const STORAGE_KEY = "kasicart_cart";
const SAVED_KEY = "kasicart_saved";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const s = localStorage.getItem(SAVED_KEY);
      if (s) setSaved(JSON.parse(s));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); }, [saved, hydrated]);

  const add = (product: Product, opts?: { color?: string; size?: string; variantId?: string; quantity?: number }) => {
    const qty = opts?.quantity ?? 1;
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.color === opts?.color && i.size === opts?.size && i.variantId === opts?.variantId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { product, quantity: qty, color: opts?.color, size: opts?.size, variantId: opts?.variantId }];
    });
  };
  const remove = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateQty = (index: number, qty: number) => {
    if (qty <= 0) return remove(index);
    setItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: qty } : it));
  };
  const saveForLater = (index: number) => {
    setItems(prev => {
      const it = prev[index];
      if (it) setSaved(s => [...s, it]);
      return prev.filter((_, i) => i !== index);
    });
  };
  const moveToCart = (index: number) => {
    setSaved(prev => {
      const it = prev[index];
      if (it) setItems(c => [...c, it]);
      return prev.filter((_, i) => i !== index);
    });
  };
  const removeSaved = (index: number) => setSaved(prev => prev.filter((_, i) => i !== index));
  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, it) => {
    const price = it.product.variants.find(v => v.id === it.variantId)?.price ?? it.product.price;
    // also handle gift card variant price
    const actual = typeof price === "number" ? price : it.product.price;
    return sum + actual * it.quantity;
  }, 0);
  const count = items.reduce((sum, it) => sum + it.quantity, 0);

  return <Ctx.Provider value={{ items, saved, add, remove, updateQty, saveForLater, moveToCart, removeSaved, clear, subtotal, count }}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
};
