import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{ enabled: boolean; toggle: () => void; effective: boolean } | null>(null);

export function DataSaverProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("kasicart_datasaver");
      if (v === "true") setEnabled(true);
      const conn: any = (navigator as any).connection;
      if (conn) {
        const slow = conn.effectiveType === "2g" || conn.effectiveType === "slow-2g" || conn.saveData;
        if (slow && !v) setAuto(true);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("kasicart_datasaver", String(enabled)); } catch {}
    if (enabled) document.documentElement.setAttribute("data-saver", "true");
    else document.documentElement.removeAttribute("data-saver");
  }, [enabled]);

  const toggle = () => setEnabled(v => !v);
  const effective = enabled || auto;

  // connection-aware suggestion banner logic is in component
  return <Ctx.Provider value={{ enabled, toggle, effective }}>{children}</Ctx.Provider>;
}
export const useDataSaver = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDataSaver must be inside DataSaverProvider");
  return v;
};
