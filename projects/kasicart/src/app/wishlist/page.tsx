import { useWishlist } from "@/projects/kasicart/store/WishlistContext";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { products } from "@/projects/kasicart/data/products";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import Link from "@/projects/kasicart/compat/next";
import { Button } from "@/projects/kasicart/components/ui/Button";

export default function WishlistPage() {
  const { ids, toggle, clear } = useWishlist();
  const { add } = useCart();
  const items = products.filter(p=> ids.includes(p.id));
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Wishlist — {items.length} {items.length===1?"item":"items"}</h1>
          <p className="text-sm text-stone-500">Saved locally in this browser. No account required. Share your wishlist with a link (demo).</p>
        </div>
        {items.length>0 && <button onClick={clear} className="text-sm underline">Clear all</button>}
      </div>
      {items.length===0 ? (
        <div className="py-16 text-center bg-white border border-[#E8E2D8] rounded-[20px]">
          <p className="text-4xl mb-2">♡</p>
          <p className="font-medium">Your wishlist is empty</p>
          <p className="text-sm text-stone-500 mt-1">Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="inline-flex mt-4 h-10 px-6 rounded-full bg-[#11110F] text-white items-center text-sm">Browse shop</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map(p=>(
              <div key={p.id} className="relative">
                <ProductCard product={p} />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={()=>{ add(p); toggle(p.id); }} className="flex-1">Move to cart</Button>
                  <button onClick={()=>toggle(p.id)} className="h-8 px-3 rounded-full border border-[#E8E2D8] text-xs">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={()=>{ items.forEach(p=> add(p)); clear(); }}>Move all to cart</Button>
            <button onClick={()=>{
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert("Wishlist link copied (demo) — " + url);
            }} className="h-10 px-5 rounded-full border border-[#E8E2D8] bg-white text-sm">Share wishlist</button>
          </div>
        </>
      )}
    </div>
  );
}
