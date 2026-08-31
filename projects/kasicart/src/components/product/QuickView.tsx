
import { Product } from "@/projects/kasicart/types";
import { Price } from "@/projects/kasicart/components/ui/Price";
import { Button } from "@/projects/kasicart/components/ui/Button";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { useState } from "react";
import Link from "@/projects/kasicart/compat/next";

export function QuickView({ product, onClose }: { product: Product; onClose: ()=>void }) {
  const { add } = useCart();
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [added, setAdded] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-[#FFFBF5] w-full md:max-w-[860px] max-h-[92dvh] md:max-h-[92vh] overflow-auto rounded-t-[20px] md:rounded-[20px] flex flex-col md:flex-row pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 md:w-8 md:h-8 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center z-10 active:scale-95 transition">✕</button>
        <div className="md:w-[48%] bg-[#F5EEE6] p-4 sm:p-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images[0]} alt={product.name} className="w-full aspect-[4/5] object-cover rounded-[16px]"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
        </div>
        <div className="flex-1 p-6 md:p-8 space-y-4">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-stone-500">{product.brand} · {product.sellerLocation}</p>
            <h3 className="text-[22px] font-semibold leading-tight mt-1">{product.name}</h3>
            <p className="text-sm text-stone-600 mt-2 line-clamp-3">{product.description}</p>
          </div>
          <Price price={product.price} compareAt={product.compareAtPrice} size="lg" />
          {product.colors && (
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Colour — {color}</p>
              <div className="flex gap-2">
                {product.colors.map(c=>(
                  <button key={c.name} onClick={()=>setColor(c.name)} className={`w-8 h-8 rounded-full border-2 ${color===c.name?"border-[#11110F]":"border-white"} ring-1 ring-black/10`} style={{background:c.hex}} aria-label={c.name} />
                ))}
              </div>
            </div>
          )}
          {product.sizes && (
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Size — {size}</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s=>(
                  <button key={s} onClick={()=>setSize(s)} className={`px-4 h-9 rounded-full text-sm border ${size===s?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#D6CFC2] hover:border-[#11110F]"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={()=>{ add(product,{color,size}); setAdded(true); setTimeout(()=>setAdded(false),1500); }}
              className="flex-1"
              disabled={product.stockStatus==="out-of-stock"}
            >
              {added ? "Added ✓" : product.stockStatus==="out-of-stock" ? "Out of stock" : "Add to cart"}
            </Button>
            <Link href={`/product/${product.slug}`} onClick={onClose} className="h-10 px-5 rounded-full border border-[#D6CFC2] flex items-center text-sm font-medium hover:bg-[#11110F] hover:text-white hover:border-[#11110F]">View</Link>
          </div>
          <p className="text-xs text-stone-500">{product.deliveryEstimate} · Delivery available across South Africa.</p>
        </div>
      </div>
    </div>
  );
}
