import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const Ctx = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Force light theme for now — dark needs proper design pass
    try {
      const stored = localStorage.getItem("kasicart_theme") as Theme | null;
      // Ignore system preference, default to light unless explicitly stored as light
      const initial: Theme = stored === "dark" ? "light" : "light";
      // Clear any dark preference
      if (stored === "dark") localStorage.setItem("kasicart_theme", "light");
      setThemeState("light");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
      // Also clear class
      document.documentElement.classList.remove("dark");
    } catch {}
  }, []);

  const setTheme = (t: Theme) => {
    // Lock to light for now
    const forced: Theme = "light";
    setThemeState(forced);
    try { localStorage.setItem("kasicart_theme", forced); } catch {}
    document.documentElement.setAttribute("data-theme", forced);
    document.documentElement.style.colorScheme = forced;
  };
  const toggle = () => {
    // Disabled — keep light
    setTheme("light");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
    document.documentElement.classList.remove("dark");
  }, [theme]);

  return <Ctx.Provider value={{ theme: "light", toggle, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be inside ThemeProvider");
  return v;
};
