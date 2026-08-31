import React, { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{
  ids: string[];
  add: (id: string) => void;
} | null>(null);

const KEY = "kasicart_recent";

export function RecentProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setIds(JSON.parse(raw)); } catch {}
  }, []);
  const add = (id: string) => {
    setIds(prev => {
      const filtered = prev.filter(x => x !== id);
      const next = [id, ...filtered].slice(0, 10);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };
  return <Ctx.Provider value={{ ids, add }}>{children}</Ctx.Provider>;
}
export const useRecent = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRecent must be inside RecentProvider");
  return v;
};
