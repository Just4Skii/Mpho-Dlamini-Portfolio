import React, { createContext, useContext, useState } from "react";

const Ctx = createContext<{
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
} | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const toggle = (id: string) => setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  const has = (id: string) => ids.includes(id);
  const clear = () => setIds([]);
  return <Ctx.Provider value={{ ids, toggle, has, clear }}>{children}</Ctx.Provider>;
}
export const useCompare = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCompare must be inside CompareProvider");
  return v;
};
