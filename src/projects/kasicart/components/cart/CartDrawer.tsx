
import { useCart } from "@/projects/kasicart/store/CartContext";
import { formatPrice } from "@/projects/kasicart/lib/utils";
import Link from "@/projects/kasicart/compat/next";
import { Button } from "@/projects/kasicart/components/ui/Button";
import { useState } from "react";

export function CartDrawer({ onClose }: { onClose: ()=>void }) {
  const { items, saved, remove, updateQty, saveForLater, moveToCart, removeSaved, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code==="LOCAL10") { setDiscount(Math.round(subtotal*0.10)); setCouponMsg("LOCAL10 applied — 10% off"); }
    else if (code==="WELCOME15") { setDiscount(Math.round(subtotal*0.15)); setCouponMsg("WELCOME15 applied — 15% off"); }
    else { setDiscount(0); setCouponMsg("Invalid code. Try LOCAL10 or WELCOME15."); }
  };

  const delivery = subtotal > 750 || subtotal===0 ? 0 : 95;
  const total = subtotal - discount + delivery;
  const freeShipRemaining = Math.max(0, 750 - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-[#FFFBF5] w-full md:max-w-[440px] h-[100dvh] md:h-full flex flex-col shadow-2xl">
        <div className="h-[56px] sm:h-[64px] px-4 sm:px-6 flex items-center justify-between border-b border-[#E8E2D8] shrink-0">
          <h2 className="font-semibold">Cart — {items.length} {items.length===1?"item":"items"}</h2>
          <button onClick={onClose} className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#11110F] text-white flex items-center justify-center shrink-0 active:scale-95 transition">✕</button>
        </div>

        <div className="flex-1 overflow-auto">
          {items.length===0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">👜</p>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-stone-500 mt-1">Add something good — free delivery over R750.</p>
              <Link href="/shop" onClick={onClose} className="inline-flex mt-4 h-10 px-6 rounded-full bg-[#11110F] text-white items-center text-sm font-medium">Start shopping</Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* free shipping progress */}
              <div className="p-3 rounded-xl bg-[#E6EDE8] border border-[#1E3A2E]/10">
                {freeShipRemaining>0 ? (
                  <p className="text-sm"><span className="font-medium">You’re R{freeShipRemaining.toLocaleString("en-ZA")} away from free delivery.</span> <span className="text-stone-600">Free standard delivery over R750.</span></p>
                ) : (
                  <p className="text-sm font-medium">✓ You’ve unlocked free delivery.</p>
                )}
                <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#1E3A2E] transition-all" style={{width: `${Math.min(100, (subtotal/750)*100)}%`}} />
                </div>
              </div>

              {items.map((it, idx)=> {
                const price = it.product.variants.find(v=>v.id===it.variantId)?.price ?? it.product.price;
                return (
                  <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white border border-[#E8E2D8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.product.images[0]} alt={it.product.name} className="w-20 h-20 rounded-lg object-cover bg-[#F5EEE6]"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs tracking-widest uppercase text-stone-500">{it.product.brand}</p>
                      <p className="text-sm font-medium leading-tight line-clamp-2">{it.product.name}</p>
                      {(it.color||it.size) && <p className="text-xs text-stone-500 mt-0.5">{[it.color,it.size].filter(Boolean).join(" · ")}</p>}
                      <p className="text-sm font-semibold mt-1">{formatPrice(price)} </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-full border border-[#E8E2D8] overflow-hidden">
                          <button onClick={()=>updateQty(idx, it.quantity-1)} className="w-10 h-10 md:w-8 md:h-7 text-[15px] hover:bg-[#F5EEE6] active:bg-[#E8E2D8] transition">−</button>
                          <span className="w-10 md:w-8 text-center text-sm font-medium">{it.quantity}</span>
                          <button onClick={()=>updateQty(idx, it.quantity+1)} className="w-10 h-10 md:w-8 md:h-7 text-[15px] hover:bg-[#F5EEE6] active:bg-[#E8E2D8] transition">+</button>
                        </div>
                        <button onClick={()=>saveForLater(idx)} className="text-xs underline underline-offset-4">Save for later</button>
                        <button onClick={()=>remove(idx)} className="text-xs text-stone-500 hover:text-[#C45D3C] ml-auto">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* saved */}
              {saved.length>0 && (
                <div className="pt-4 border-t border-[#E8E2D8]">
                  <p className="text-sm font-medium mb-2">Saved for later — {saved.length}</p>
                  <div className="space-y-2">
                    {saved.map((it,idx)=>(
                      <div key={idx} className="flex gap-3 p-3 rounded-xl bg-[#F5EEE6] border border-[#E8E2D8]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.product.images[0]} alt={it.product.name} className="w-16 h-16 rounded-lg object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{it.product.name}</p>
                          <p className="text-xs text-stone-500">{formatPrice(it.product.price)}</p>
                          <div className="flex gap-2 mt-1">
                            <button onClick={()=>moveToCart(idx)} className="text-xs font-medium underline">Move to cart</button>
                            <button onClick={()=>removeSaved(idx)} className="text-xs text-stone-500">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length>0 && (
          <div className="border-t border-[#E8E2D8] p-4 md:p-6 bg-white space-y-3 shrink-0">
            <div className="flex gap-2">
              <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 h-10 rounded-full border border-[#E8E2D8] px-4 text-sm outline-none focus:border-[#11110F]" />
              <button onClick={applyCoupon} className="h-10 px-5 rounded-full bg-white border border-[#11110F] text-sm font-medium hover:bg-[#11110F] hover:text-white">Apply</button>
            </div>
            {couponMsg && <p className={`text-xs ${discount>0?"text-green-700":"text-[#C45D3C]"}`}>{couponMsg}</p>}
            <p className="text-[11px] tracking-widest uppercase text-stone-500">Try LOCAL10 or WELCOME15 — demo codes, not real promotions.</p>

            <div className="space-y-1.5 text-sm pt-2">
              <div className="flex justify-between"><span className="text-stone-600">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              {discount>0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-stone-600">Estimated delivery</span><span>{delivery===0 ? "Free" : formatPrice(delivery)}</span></div>
              <div className="flex justify-between text-[16px] font-semibold pt-2 border-t border-[#E8E2D8]"><span>Total</span><span>{formatPrice(total)}</span></div>
              <p className="text-xs text-stone-500">Delivery available across South Africa. 2–4 business days.</p>
            </div>

            <Link href="/checkout" onClick={onClose} className="flex h-12 rounded-full bg-[#11110F] text-white items-center justify-center font-medium hover:bg-black">Continue to checkout</Link>
            <button onClick={onClose} className="w-full h-10 rounded-full border border-[#E8E2D8] text-sm font-medium hover:border-[#11110F]">Continue shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}
