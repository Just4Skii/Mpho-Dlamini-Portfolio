import Link from "@/projects/kasicart/compat/next";
import { usePathname } from "@/projects/kasicart/compat/next";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { useWishlist } from "@/projects/kasicart/store/WishlistContext";

export function MobileNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { ids } = useWishlist();
  const items = [
    { href:"/", label:"Home", icon:"⌂" },
    { href:"/shop", label:"Shop", icon:"▦" },
    { href:"/wishlist", label:"Wishlist", icon:"♡", badge: ids.length },
    { href:"/account", label:"Account", icon:"◯" },
  ];
  // Hide on product detail when sticky add-to-cart is visible — avoid double bottom bar
  const isProduct = pathname.startsWith("/product/");
  // Keep nav but let product sticky sit above it; do not hide entirely — just ensure z-order
  return (
    <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-[#E8E2D8] flex justify-around pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] ${isProduct ? "opacity-95" : ""}`}>
      {items.map(it=>{
        const active = pathname===it.href || (it.href!=="/" && pathname.startsWith(it.href));
        return (
          <Link key={it.href} href={it.href} className={`flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 rounded-xl min-w-[64px] active:scale-95 transition ${active?"text-[#11110F]":"text-stone-500"}`}>
            <span className="relative text-[18px] leading-none">
              {it.icon}
              {it.badge ? <span className="absolute -top-1.5 -right-3 w-4 h-4 rounded-full bg-[#C45D3C] text-white text-[10px] flex items-center justify-center">{it.badge}</span> : null}
              {it.label==="Shop" && count>0 && <span className="absolute -top-1.5 -right-3 w-4 h-4 rounded-full bg-[#11110F] text-white text-[10px] flex items-center justify-center">{count}</span>}
            </span>
            <span className="text-[11px] mt-0.5 font-medium tracking-wide">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
