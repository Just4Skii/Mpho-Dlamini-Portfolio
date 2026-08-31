import React, { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
} | null>(null);

const KEY = "kasicart_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setIds(JSON.parse(raw)); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids, hydrated]);
  const toggle = (id: string) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const has = (id: string) => ids.includes(id);
  const clear = () => setIds([]);
  return <Ctx.Provider value={{ ids, toggle, has, clear }}>{children}</Ctx.Provider>;
}
export const useWishlist = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be inside WishlistProvider");
  return v;
};
