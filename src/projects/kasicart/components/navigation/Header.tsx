import Link from "@/projects/kasicart/compat/next";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { useWishlist } from "@/projects/kasicart/store/WishlistContext";
import { useState, useEffect } from "react";
import { SearchOverlay } from "@/projects/kasicart/components/search/SearchOverlay";
import { CartDrawer } from "@/projects/kasicart/components/cart/CartDrawer";
import { usePathname } from "@/projects/kasicart/compat/next";
import { useDataSaver } from "@/projects/kasicart/store/DataSaverContext";
import { useOffline } from "@/projects/kasicart/store/OfflineContext";

export function Header() {
  const { count } = useCart();
  const { ids } = useWishlist();
  const { enabled: dataSaver, toggle: toggleSaver } = useDataSaver();
  const { online } = useOffline();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileMenu(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(v => !v); } if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* SA accent bar — landscape gradient: Karoo terracotta → Savanna ochre → Fynbos sage → Kalahari sand → Atlantic slate */}
      <div className="sa-accent-bar" aria-hidden />
      <div className="bg-[var(--accent-slate)] text-[var(--accent-sand)] text-[11px] sm:text-[12px] text-center py-2 tracking-wide px-4 flex items-center justify-center gap-2">
        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden />
        <span>Free delivery over R750 — Delivery across South Africa.</span>
        <Link href="/help" className="underline underline-offset-4 decoration-[var(--accent-sand)]/50 hover:decoration-[var(--accent-sand)] whitespace-nowrap">Learn more</Link>
        <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-[10px] tracking-widest uppercase opacity-60">
          <span className="w-2 h-0.5 bg-[var(--accent)]" /> <span className="w-2 h-0.5 bg-[var(--accent-ochre)]" /> <span className="w-2 h-0.5 bg-[var(--accent-sage)]" />
        </span>
      </div>

      <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/85 border-b border-[var(--border)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 h-[60px] sm:h-[64px] flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Mobile menu */}
          <button className="md:hidden w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] flex items-center justify-center shrink-0 active:scale-95 transition" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu" aria-expanded={mobileMenu}>
            <span className="text-[18px] leading-none">{mobileMenu ? "✕" : "≡"}</span>
          </button>

          {/* Brand — fixed: no truncate, premium serif+sans lockup */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="relative w-9 h-9 rounded-xl bg-[#11110F] dark:bg-white text-white dark:text-[#11110F] flex items-center justify-center text-[13px] font-bold tracking-tight shrink-0 shadow-sm group-hover:scale-[1.02] transition">
              KC
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[#11110F] dark:border-white" aria-hidden />
            </span>
            <span className="flex items-baseline gap-[1px] whitespace-nowrap leading-none">
              <span className="text-[19px] sm:text-[20px] font-semibold tracking-[-0.02em]" style={{ fontFamily: "var(--font-instrument)" }}>
                Kasi
              </span>
              <span className="text-[19px] sm:text-[20px] font-light tracking-[-0.02em] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition">
                Cart
              </span>
            </span>
            <span className="hidden xl:inline-flex flex-col ml-2 pl-3 border-l border-[var(--border)] leading-none">
              <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--muted-foreground)]">Good things,</span>
              <span className="text-[10px] tracking-[0.16em] uppercase font-medium text-[var(--accent)]">close to home.</span>
            </span>
          </Link>

          {/* Desktop nav — editorial, SA-aware */}
          <nav className="hidden lg:flex items-center gap-1 text-[14px] font-medium ml-2">
            <Link href="/discover" className="px-3.5 py-1.5 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition">Discover</Link>
            <Link href="/shop" className="px-3 py-1.5 rounded-full hover:bg-[var(--muted)] transition">Shop</Link>
            <div className="hidden xl:flex items-center gap-1 ml-1">
              {[
                ["Home", "/category/home"],
                ["Fashion", "/category/fashion"],
                ["Beauty", "/category/beauty"],
                ["Design", "/category/design"],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="px-2.5 py-1.5 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition text-[13px]">
                  {label}
                </Link>
              ))}
            </div>
            <Link href="/gifts" className="px-3 py-1.5 rounded-full hover:bg-[var(--muted)] transition hidden sm:inline-flex">Gifts</Link>
            <Link href="/moodboard" className="px-2.5 py-1.5 rounded-full hover:bg-[var(--muted)] transition hidden xl:inline-flex text-[13px]">Moodboard</Link>
            <Link href="/stories" className="px-2.5 py-1.5 rounded-full hover:bg-[var(--muted)] transition hidden xl:inline-flex text-[13px]">Stories</Link>
          </nav>

          <div className="flex-1 min-w-0" />

          {/* Search */}
          <button onClick={() => setSearchOpen(true)} className="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--foreground)] transition">
            <span aria-hidden>⌕</span> Search <span className="ml-1 hidden lg:inline-flex text-[11px] bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded">⌘ K</span>
          </button>
          <button onClick={() => setSearchOpen(true)} aria-label="Search" className="md:hidden w-10 h-10 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center shrink-0 active:scale-95 transition text-[var(--foreground)]">⌕</button>

          {/* Data saver - desktop */}
          <button
            onClick={toggleSaver}
            title={dataSaver ? "Data Saver on — click to disable" : "Enable Data Saver"}
            className={`hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-medium shrink-0 transition ${dataSaver ? "bg-[var(--accent-slate)] text-white border-[var(--accent-slate)]" : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]"}`}
          >
            <span className={`w-2 h-2 rounded-full ${dataSaver ? "bg-[var(--accent)] animate-pulse" : online ? "bg-emerald-500" : "bg-amber-500"}`} />
            {dataSaver ? "Data Saver" : "Saver off"}
          </button>

          {/* Icons */}
          <Link href="/wishlist" className="relative w-10 h-10 md:w-9 md:h-9 rounded-full border border-[var(--border)] bg-[var(--card)] flex items-center justify-center hover:border-[var(--accent)] shrink-0 active:scale-95 transition text-[var(--foreground)]">
            <span className="text-[16px] leading-none">♡</span>
            {ids.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[11px] flex items-center justify-center font-medium">{ids.length}</span>}
          </Link>
          <Link href="/account" className="hidden md:flex w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--card)] items-center justify-center hover:border-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition">
            <span aria-hidden>◯</span>
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 sm:gap-2 h-10 md:h-9 px-3 sm:px-4 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 shrink-0 active:scale-95 transition">
            <span className="hidden sm:inline">Cart</span>
            <span className="sm:hidden text-[13px]" aria-hidden>👜</span>
            <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white dark:bg-white dark:text-[#11110F] flex items-center justify-center text-xs font-bold">{count}</span>
          </button>
        </div>

        {/* Mobile menu — theme-aware */}
        {mobileMenu && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-5 space-y-4 max-h-[70dvh] overflow-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest uppercase text-[var(--muted-foreground)]">Menu</span>
              <span className={`w-2 h-2 rounded-full ${dataSaver ? "bg-[var(--accent)]" : "bg-emerald-500"}`} />
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-sm">
              <Link href="/discover" className="p-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] border border-[var(--foreground)] text-center font-medium">✨ Discover</Link>
              <Link href="/shop" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center hover:border-[var(--accent)]">Shop all</Link>
              <Link href="/moodboard" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Moodboard</Link>
              <Link href="/build-room" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Build Room</Link>
              <Link href="/build-look" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Build Look</Link>
              <Link href="/stories" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Stories</Link>
              <Link href="/brands" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Brands</Link>
              <Link href="/local" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Local</Link>
              <Link href="/gifts" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Gifts</Link>
              <Link href="/compare" className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-center">Compare</Link>
            </div>
            <div className="flex gap-2">
              <Link href="/category/home" className="flex-1 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center text-sm">Home</Link>
              <Link href="/category/fashion" className="flex-1 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-sm">Fashion</Link>
              <Link href="/category/beauty" className="flex-1 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-sm">Beauty</Link>
            </div>
            <Link href="/account" className="block text-center text-sm underline underline-offset-4 decoration-[var(--border)]">Account & orders</Link>
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[var(--border)] text-xs">
              <button onClick={toggleSaver} className="underline">{dataSaver ? "Data Saver on — tap to disable" : "Enable Data Saver"}</button>
              <span className="text-[var(--border)]">·</span>
              <span className={online ? "text-emerald-600" : "text-amber-600"}>{online ? "Online" : "Offline"}</span>
            </div>
          </div>
        )}
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  );
}
