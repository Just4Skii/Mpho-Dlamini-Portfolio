import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{ online: boolean } | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return <Ctx.Provider value={{ online }}>{children}</Ctx.Provider>;
}
export const useOffline = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOffline must be inside OfflineProvider");
  return v;
};
