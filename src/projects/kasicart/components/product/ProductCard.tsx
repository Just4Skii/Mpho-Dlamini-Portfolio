import Link from "@/projects/kasicart/compat/next";
import { Product } from "@/projects/kasicart/types";
import { Price } from "@/projects/kasicart/components/ui/Price";
import { Badge } from "@/projects/kasicart/components/ui/Badge";
import { useWishlist } from "@/projects/kasicart/store/WishlistContext";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { useState } from "react";

export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (p:Product)=>void }) {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const wished = has(product.id);
  const lowStock = product.stockStatus === "low-stock";
  const outOfStock = product.stockStatus === "out-of-stock";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    add(product);
    setAdded(true);
    setTimeout(()=>setAdded(false),1500);
  };

  return (
    <div className="group relative flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EEE6] rounded-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700 ease-out"
            loading="lazy"
            decoding="async"
            onError={(e)=> { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }}
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.badges?.slice(0,2).map(b=>(
              <Badge key={b} tone={b==="Bestseller"?"terracotta":b==="New"?"green":"stone"}>{b}</Badge>
            ))}
          </div>
          <button
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur bg-white/90 border border-white shadow-sm hover:bg-white active:scale-95 transition ${wished?"text-[#C45D3C]":"text-[#11110F]"}`}
          >
            <span className="text-[15px] leading-none">{wished ? "♥" : "♡"}</span>
          </button>
          {outOfStock && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><span className="bg-[#11110F] text-white text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-full">Out of stock</span></div>}
          {/* quick view on hover desktop */}
          <div className="absolute inset-x-3 bottom-3 hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button onClick={(e)=>{ e.preventDefault(); onQuickView?.(product); }} className="flex-1 bg-white text-[#11110F] text-[13px] font-medium h-9 rounded-full hover:bg-[#11110F] hover:text-white transition">Quick view</button>
            <button onClick={handleQuickAdd} disabled={outOfStock} className="w-9 h-9 rounded-full bg-[#11110F] text-white flex items-center justify-center hover:bg-black disabled:opacity-40">{added ? "✓" : "+"}</button>
          </div>
        </div>
      </Link>
      <div className="pt-3 pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] tracking-widest uppercase text-stone-500 truncate">{product.brand} · {product.sellerLocation}</p>
            <Link href={`/product/${product.slug}`} className="block">
              <h3 className="text-[14.5px] font-medium leading-tight line-clamp-2 hover:underline decoration-stone-300 underline-offset-4">{product.name}</h3>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Price price={product.price} compareAt={product.compareAtPrice} size="sm" />
          {lowStock && <span className="text-[11px] font-medium text-[#C45D3C]">Low stock</span>}
        </div>
        {product.colors && (
          <div className="flex gap-1 pt-1">
            {product.colors.slice(0,4).map(c=>(
              <span key={c.name} title={c.name} className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-black/10" style={{background:c.hex}} />
            ))}
            {product.colors.length>4 && <span className="text-[11px] text-stone-500">+{product.colors.length-4}</span>}
          </div>
        )}
      </div>
      {/* mobile quick add */}
      <button onClick={handleQuickAdd} disabled={outOfStock} className="md:hidden mt-2 w-full h-9 rounded-full border border-[#D6CFC2] bg-white text-[13px] font-medium hover:bg-[#11110F] hover:text-white hover:border-[#11110F] disabled:opacity-40 transition active:scale-[0.98]">
        {added ? "Added ✓" : outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
