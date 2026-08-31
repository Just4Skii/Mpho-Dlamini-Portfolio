import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon, LogoMark } from "./icons";
import type { IconName } from "./icons";
import { Button } from "./ui";
import { useApp } from "../store/store";
import { SearchOverlay } from "./SearchOverlay";
import { getProviderById } from "../data/providers";
import { cx } from "../lib/utils";

const NAV = [
  { to: "/search", label: "Find care" },
  { to: "/specialties", label: "Specialties" },
  { to: "/clinics", label: "Clinics" },
  { to: "/locations", label: "Locations" },
  { to: "/guides", label: "Guides" },
];

import { ReturnToPortfolio } from "./ReturnToPortfolio";

export function Layout() {
  const { saved, compare, clearCompare, toasts, dismissToast } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ReturnToPortfolio projectName="CarePoint" />
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-pine focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to main content
      </a>

      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-50 border-b border-line bg-cream/92 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5" aria-label="CarePoint home">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-[19px] font-semibold tracking-tight">CarePoint</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx(
                    "rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors",
                    isActive ? "bg-pine-3 text-pine-2" : "text-ink-2 hover:bg-paper hover:text-ink",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-9 items-center gap-2.5 rounded-full border border-line-2 bg-card pl-3 pr-2 text-[13px] text-ink-3 transition-colors hover:border-pine hover:text-pine-2 md:flex"
              aria-label="Open search"
            >
              <Icon name="search" className="h-4 w-4" />
              Search providers…
              <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-sans text-[10.5px] font-semibold text-ink-3">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-card text-ink-2 hover:border-pine hover:text-pine-2 md:hidden"
              aria-label="Open search"
            >
              <Icon name="search" className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/account/saved"
              aria-label={`Saved providers (${saved.length})`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:border-pine hover:text-pine-2"
            >
              <Icon name="heart" className="h-[18px] w-[18px]" />
              {saved.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-pine px-1 text-[10.5px] font-bold text-cream">
                  {saved.length}
                </span>
              )}
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:border-pine hover:text-pine-2 sm:inline-flex"
            >
              <Icon name="user" className="h-[18px] w-[18px]" />
            </Link>
            <Button to="/search" size="sm" className="hidden sm:inline-flex">
              Find a provider
            </Button>
          </div>
        </div>
      </header>

      {/* ---------- page ---------- */}
      <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none lg:pb-0">
        <Outlet />
      </main>

      {/* ---------- compare tray ---------- */}
      {compare.length > 0 && location.pathname !== "/compare" && (
        <div className="anim-toast pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center px-4 lg:bottom-6">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-night px-4 py-3 text-cream shadow-lift">
            <Icon name="columns" className="h-5 w-5 text-pine-4" />
            <span className="text-[13.5px] font-semibold">
              {compare.length} provider{compare.length > 1 ? "s" : ""} to compare
            </span>
            <Button size="sm" onClick={() => navigate("/compare")}>
              Compare
            </Button>
            <button type="button" onClick={clearCompare} aria-label="Clear comparison" className="rounded-lg p-1.5 text-cream/60 hover:bg-night-2 hover:text-cream">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------- toasts ---------- */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6 lg:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "anim-toast pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] font-semibold shadow-lift",
              t.kind === "success" && "border-pine-4 bg-pine text-cream",
              t.kind === "info" && "border-line bg-night text-cream",
              t.kind === "danger" && "border-danger/40 bg-danger text-cream",
            )}
          >
            <Icon name={t.kind === "success" ? "checkCircle" : t.kind === "danger" ? "alert" : "info"} className="h-[18px] w-[18px] shrink-0" />
            <span>{t.message}</span>
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="ml-1 rounded p-1 opacity-70 hover:opacity-100">
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* ---------- mobile bottom nav ---------- */}
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5">
          {[
            { to: "/", label: "Home", icon: "home" },
            { to: "/search", label: "Find", icon: "search" },
            { to: "/account/saved", label: "Saved", icon: "heart" },
            { to: "/account/appointments", label: "Bookings", icon: "calendar" },
            { to: "/account", label: "Account", icon: "user" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cx(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold transition-colors",
                  isActive ? "text-pine" : "text-ink-3 hover:text-ink",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon as IconName} className="h-[21px] w-[21px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

/* ---------- footer ---------- */

function FooterCol({ title, links }: { title: string; links: Array<{ to: string; label: string }> }) {
  return (
    <div>
      <h3 className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-cream/45">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="text-[14px] text-cream/75 underline-offset-4 transition-colors hover:text-cream hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-night text-cream">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-[19px] font-semibold">CarePoint</span>
          </Link>
          <p className="mt-4 max-w-xs font-display text-[17px] italic leading-snug text-cream/85">“Finding the right care should feel simpler.”</p>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-cream/55">
            Discover healthcare providers, clinics and appointment options across South Africa. CarePoint is an independent product concept — every provider, clinic, review and availability listing shown here is fictional sample data.
          </p>
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-cream/15 bg-night-2 px-3.5 py-3">
            <Icon name="heartPulse" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger-bg" />
            <p className="text-[12.5px] leading-relaxed text-cream/70">
              If you believe you are experiencing a medical emergency, seek immediate emergency assistance — call 112 from any cellphone.
            </p>
          </div>
        </div>
        <FooterCol
          title="Explore"
          links={[
            { to: "/search", label: "Find care" },
            { to: "/specialties", label: "Specialties" },
            { to: "/clinics", label: "Clinics & facilities" },
            { to: "/locations", label: "Locations" },
            { to: "/compare", label: "Compare providers" },
          ]}
        />
        <FooterCol
          title="Care"
          links={[
            { to: "/urgent-care", label: "Urgent care guidance" },
            { to: "/guides", label: "Healthcare guides" },
            { to: "/search?aid=CareSure", label: "Medical aid options" },
            { to: "/for-providers", label: "For providers" },
          ]}
        />
        <FooterCol
          title="Your CarePoint"
          links={[
            { to: "/account", label: "Account dashboard" },
            { to: "/account/appointments", label: "Appointments" },
            { to: "/account/saved", label: "Saved providers" },
          ]}
        />
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-2 py-5 text-[12.5px] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CarePoint — product concept, frontend demonstration only.</span>
          <span>No real bookings, medical advice or provider verification is provided.</span>
        </div>
      </div>
    </footer>
  );
}
