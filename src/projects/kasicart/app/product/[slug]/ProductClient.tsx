
import { Product } from "@/projects/kasicart/types";
import { Price } from "@/projects/kasicart/components/ui/Price";
import { Button } from "@/projects/kasicart/components/ui/Button";
import { Rating } from "@/projects/kasicart/components/ui/Rating";
import { Badge } from "@/projects/kasicart/components/ui/Badge";
import { useCart } from "@/projects/kasicart/store/CartContext";
import { useWishlist } from "@/projects/kasicart/store/WishlistContext";
import { useCompare } from "@/projects/kasicart/store/CompareContext";
import { useRecent } from "@/projects/kasicart/store/RecentContext";
import { relatedProducts } from "@/projects/kasicart/lib/recommendations";
import { products } from "@/projects/kasicart/data/products";
import { reviews } from "@/projects/kasicart/data/reviews";
import Link from "@/projects/kasicart/compat/next";
import { useState, useEffect } from "react";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";

export function ProductClient({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { has: hasCompare, toggle: toggleCompare } = useCompare();
  const recent = useRecent();
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [size, setSize] = useState(product.sizes?.[0] || product.variants.find(v=>v.size)?.size);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [notify, setNotify] = useState(false);
  const [postal, setPostal] = useState("");
  const [estimate, setEstimate] = useState("");
  const [activeTab, setActiveTab] = useState<"description"|"specs"|"shipping"|"reviews">("description");
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(()=>{ recent.add(product.id); }, [product.id]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="ArrowLeft") setActiveImg(i=> Math.max(0,i-1));
      if(e.key==="ArrowRight") setActiveImg(i=> Math.min(product.images.length-1,i+1));
      if(e.key==="Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey); return ()=>window.removeEventListener("keydown",onKey);
  }, [product.images.length]);

  const selectedVariant = product.variants.find(v => {
    if (color && v.color && v.color !== color) return false;
    if (size && v.size && v.size !== size) return false;
    return true;
  }) || product.variants[0];

  const outOfStock = product.stockStatus==="out-of-stock" || selectedVariant?.stock===0;
  const lowStock = product.stockStatus==="low-stock" || (selectedVariant && selectedVariant.stock>0 && selectedVariant.stock<=5);

  const handleAdd = () => {
    if (outOfStock) return;
    add(product, { color, size, variantId: selectedVariant?.id, quantity: qty });
    setAdded(true);
    setTimeout(()=>setAdded(false), 2000);
  };

  const related = relatedProducts(product, 4);
  const productReviews = reviews.filter(r=> r.productSlug===product.slug);
  const alsoLike = products.filter(p=> p.category===product.category && p.id!==product.id).slice(0,4);

  const checkDelivery = () => {
    if (!postal.trim()) { setEstimate("Enter a postal code to see an estimate."); return; }
    // simple deterministic rule
    const code = Number(postal.replace(/\D/g,"").slice(0,4));
    if (!code) { setEstimate("Enter a valid South African postal code (e.g. 2196)."); return; }
    if (code < 2000) setEstimate("Estimated delivery: 2–3 business days to Gauteng & surrounds.");
    else if (code < 4000) setEstimate("Estimated delivery: 2–4 business days to KwaZulu-Natal / Free State.");
    else setEstimate("Estimated delivery: 3–5 business days to Western Cape & coastal areas.");
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 sm:py-6 pb-24 lg:pb-6">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-stone-500 flex items-center gap-1 mb-4">
        <Link href="/" className="hover:underline">Home</Link> <span>/</span>
        <Link href={`/category/${product.category}`} className="hover:underline capitalize">{product.category}</Link> <span>/</span>
        <Link href={`/shop?subcategory=${encodeURIComponent(product.subcategory)}`} className="hover:underline">{product.subcategory}</Link> <span>/</span>
        <span className="text-[#11110F] truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10">
        {/* gallery */}
        <div className="flex gap-3">
          <div className="hidden md:flex flex-col gap-2 shrink-0">
            {product.images.map((img,i)=>(
              <button key={i} onClick={()=>setActiveImg(i)} aria-label={`View image ${i+1}`} className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 ${activeImg===i?"border-[#11110F]":"border-transparent"} bg-[#F5EEE6]`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="w-full h-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
              </button>
            ))}
          </div>
          <div
            className="flex-1 relative rounded-[20px] overflow-hidden bg-[#F5EEE6] aspect-[4/5] md:aspect-[4/5] group touch-pan-y"
            onTouchStart={(e)=> setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e)=>{
              if (touchStart===null) return;
              const diff = e.changedTouches[0].clientX - touchStart;
              if (Math.abs(diff) > 40) {
                if (diff < 0) setActiveImg(i=> Math.min(product.images.length-1, i+1));
                else setActiveImg(i=> Math.max(0, i-1));
              }
              setTouchStart(null);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className={`w-full h-full object-cover select-none ${zoom?"scale-[1.6] cursor-zoom-out":"cursor-zoom-in"}`}
              onClick={()=>setZoom(!zoom)}
              draggable={false}
              onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              {product.badges?.map(b=> <Badge key={b} tone={b==="New"?"green":b==="Bestseller"?"terracotta":"stone"}>{b}</Badge>)}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs">
              <button onClick={()=>setActiveImg(i=> Math.max(0,i-1))} aria-label="Previous image" className="w-6 h-6 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center">‹</button>
              <span>{activeImg+1} / {product.images.length}</span>
              <button onClick={()=>setActiveImg(i=> Math.min(product.images.length-1,i+1))} aria-label="Next image" className="w-6 h-6 rounded-full bg-white border border-[#E8E2D8] flex items-center justify-center">›</button>
              <span className="hidden md:inline text-stone-500">· Click to {zoom?"exit":"zoom"}</span>
            </div>
            {/* mobile swipe dots */}
            <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.map((_,i)=>(
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i===activeImg?"bg-[#11110F]":"bg-white/70"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* details */}
        <div className="space-y-5">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">{product.brand} · {product.sellerLocation}</p>
            <h1 className="text-[28px] md:text-[32px] font-semibold leading-tight tracking-tight mt-1" style={{fontFamily:"var(--font-instrument)"}}>{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Rating rating={product.rating} count={product.reviewCount} />
              <span className="text-xs text-stone-500">{product.stockStatus==="in-stock" ? "In stock" : product.stockStatus==="low-stock" ? "Low stock" : product.stockStatus==="pre-order" ? "Pre-order" : "Out of stock"} · {product.stockCount>0 ? `${product.stockCount} available` : "Made to order"}</span>
            </div>
          </div>

          <Price price={product.price} compareAt={product.compareAtPrice} size="lg" />

          <p className="text-[14px] leading-relaxed text-stone-700">{product.description}</p>

          {product.colors && (
            <div>
              <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Colour — <span className="text-[#11110F] font-medium">{color}</span></p>
              <div className="flex gap-2">
                {product.colors.map(c=>{
                  const disabled = !product.variants.some(v=> v.color===c.name && v.stock>0);
                  return (
                    <button key={c.name} disabled={disabled} onClick={()=>setColor(c.name)} aria-label={c.name} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${color===c.name?"border-[#11110F]":"border-white"} ring-1 ring-black/10 disabled:opacity-30 disabled:cursor-not-allowed`} style={{background:c.hex}} title={disabled?"Unavailable":c.name} />
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs tracking-widest uppercase text-stone-500">Size — <span className="text-[#11110F] font-medium">{size}</span></p>
                <button className="text-xs underline">Size guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s=>{
                  const variant = product.variants.find(v=> v.size===s);
                  const isOut = variant ? variant.stock===0 : false;
                  return (
                    <button key={s} disabled={isOut} onClick={()=>setSize(s)} className={`px-5 h-10 rounded-full text-sm border font-medium ${size===s?"bg-[#11110F] text-white border-[#11110F]": isOut?"bg-[#F5EEE6] text-stone-400 border-[#E8E2D8] line-through":"bg-white border-[#E8E2D8] hover:border-[#11110F]"} disabled:cursor-not-allowed`}>{s}</button>
                  );
                })}
              </div>
            </div>
          )}

          {/* quantity + add */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center rounded-full border border-[#E8E2D8] bg-white overflow-hidden">
              <button onClick={()=>setQty(q=> Math.max(1,q-1))} className="w-10 h-11 text-lg hover:bg-[#F5EEE6]">−</button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={()=>setQty(q=> Math.min(10,q+1))} className="w-10 h-11 text-lg hover:bg-[#F5EEE6]">+</button>
            </div>
            <Button onClick={handleAdd} disabled={outOfStock} className="flex-1 h-11">
              {outOfStock ? "Out of stock" : added ? "Added ✓ — View cart" : "Add to cart"}
            </Button>
            <button onClick={()=>toggle(product.id)} aria-label="Wishlist" className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${has(product.id)?"bg-[#C45D3C] text-white border-[#C45D3C]":"bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}>
              <span className="text-lg">{has(product.id)?"♥":"♡"}</span>
            </button>
          </div>

          {added && (
            <div className="p-3 rounded-xl bg-[#E6EDE8] border border-[#1E3A2E]/10 flex items-center justify-between">
              <p className="text-sm font-medium">Added to cart — {qty} × {product.name}</p>
              <Link href="/shop" className="text-xs underline">Continue shopping</Link>
            </div>
          )}

          {lowStock && !outOfStock && <p className="text-xs font-medium text-[#C45D3C]">Low stock — only {selectedVariant?.stock ?? product.stockCount} left</p>}

          {outOfStock && (
            <div className="p-4 rounded-xl bg-[#F5EEE6] border border-[#E8E2D8]">
              <p className="text-sm font-medium">Out of stock — get notified when available</p>
              {!notify ? (
                <button onClick={()=>setNotify(true)} className="mt-2 h-9 px-4 rounded-full bg-[#11110F] text-white text-sm">Notify me when available</button>
              ) : (
                <p className="text-sm text-green-700 mt-2">✓ We’ll notify you — (demo) notification saved locally.</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={()=>toggleCompare(product.id)} className={`h-9 px-4 rounded-full border text-sm ${hasCompare(product.id)?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{hasCompare(product.id)?"Added to compare":"Compare"}</button>
            <button onClick={()=>{ if(navigator.share) navigator.share({title:product.name, url: window.location.href}); else { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); } }} className="h-9 px-4 rounded-full bg-white border border-[#E8E2D8] text-sm">Share</button>
            <span className="text-xs text-stone-500 self-center ml-2">SKU: {selectedVariant?.sku || product.variants[0]?.sku}</span>
          </div>

          {/* delivery estimator */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E2D8] space-y-2">
            <p className="text-sm font-medium">Delivery estimator</p>
            <p className="text-xs text-stone-500">Enter your postal code for an illustrative estimate. Not live courier data.</p>
            <div className="flex gap-2">
              <input value={postal} onChange={e=>setPostal(e.target.value)} placeholder="e.g. 2196" className="flex-1 h-9 rounded-full border border-[#E8E2D8] px-4 text-sm outline-none focus:border-[#11110F]" />
              <button onClick={checkDelivery} className="h-9 px-5 rounded-full bg-[#11110F] text-white text-sm">Check</button>
            </div>
            {estimate && <p className="text-xs bg-[#F5EEE6] p-2 rounded-lg">{estimate}</p>}
            <p className="text-xs text-stone-500">Standard: R95 · Free over R750 · {product.deliveryEstimate} · Collection available in selected areas</p>
          </div>

          {/* seller */}
          <Link href={`/brands/${product.sellerSlug}`} className="flex gap-3 p-4 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#11110F]">
            <img src={`https://picsum.photos/seed/${product.sellerSlug}/80/80`} alt={product.seller} className="w-12 h-12 rounded-full object-cover bg-[#F5EEE6]"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
            <div className="flex-1">
              <p className="text-sm font-medium">{product.seller}</p>
              <p className="text-xs text-stone-500">{product.sellerLocation} · Ships from {product.sellerLocation}</p>
              <p className="text-xs underline mt-1">View brand →</p>
            </div>
          </Link>

          {/* tabs */}
          <div className="border-t border-[#E8E2D8] pt-4">
            <div className="flex gap-2 overflow-auto scrollbar-none pb-2">
              {[
                ["description","Description"],
                ["specs","Specifications"],
                ["shipping","Shipping & returns"],
                ["reviews","Reviews"],
              ].map(([id,label])=>(
                <button key={id} onClick={()=>setActiveTab(id as any)} className={`px-4 h-8 rounded-full text-sm whitespace-nowrap border ${activeTab===id?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{label}</button>
              ))}
            </div>
            <div className="pt-4 text-sm leading-relaxed text-stone-700 min-h-[120px]">
              {activeTab==="description" && <p>{product.description} {product.care ? `Care: ${product.care}.` : ""} {product.materials ? `Materials: ${product.materials}.` : ""}</p>}
              {activeTab==="specs" && (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Materials</dt><dd className="font-medium">{product.materials || "—"}</dd></div>
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Dimensions</dt><dd className="font-medium">{product.dimensions || "—"}</dd></div>
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Weight</dt><dd className="font-medium">{product.weight || "—"}</dd></div>
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Care</dt><dd className="font-medium">{product.care || "See description"}</dd></div>
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Seller</dt><dd className="font-medium">{product.seller} — {product.sellerLocation}</dd></div>
                  <div><dt className="text-stone-500 text-xs uppercase tracking-widest">Delivery</dt><dd className="font-medium">{product.deliveryEstimate}</dd></div>
                </dl>
              )}
              {activeTab==="shipping" && (
                <div className="space-y-2">
                  <p><strong>Delivery:</strong> Standard R95, free over R750. Estimated {product.deliveryEstimate}. Delivery available across South Africa.</p>
                  <p><strong>Returns:</strong> 14-day returns for undamaged items. Seller handles fulfilment — see <Link href="/help" className="underline">Help</Link>.</p>
                  <p><strong>Collection:</strong> Available in selected areas — checkout will show options where applicable.</p>
                  <p className="text-xs text-stone-500">This is a frontend concept. No real courier integration. Estimates illustrative.</p>
                </div>
              )}
              {activeTab==="reviews" && (
                <div className="space-y-4">
                  {productReviews.length===0 ? (
                    <p className="text-stone-500">No reviews yet — be the first to share your experience.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5EEE6]">
                        <span className="text-3xl font-semibold">{product.rating.toFixed(1)}</span>
                        <div>
                          <Rating rating={product.rating} />
                          <p className="text-xs text-stone-500">{product.reviewCount} reviews · Sample commerce content (concept product)</p>
                        </div>
                      </div>
                      {productReviews.map(r=>(
                        <div key={r.id} className="p-4 rounded-xl bg-white border border-[#E8E2D8]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{r.title}</p>
                            <Rating rating={r.rating} size={12} />
                          </div>
                          <p className="text-xs text-stone-500 mt-1">{r.author} · {r.location} · {r.date} {r.verified && "· Verified purchase"}</p>
                          <p className="text-sm mt-2">{r.body}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* recommendations */}
      <section className="mt-12">
        <h2 className="text-[20px] font-semibold mb-4" style={{fontFamily:"var(--font-instrument)"}}>You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {related.map(p=> <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-[20px] font-semibold mb-4" style={{fontFamily:"var(--font-instrument)"}}>Complete the look</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {alsoLike.map(p=> <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* sticky mobile add to cart — offset above bottom nav */}
      <div className="lg:hidden fixed bottom-[64px] sm:bottom-[64px] inset-x-0 bg-white/95 backdrop-blur border-t border-[#E8E2D8] p-3 flex gap-3 items-center z-30 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-500 truncate">{product.name}</p>
          <p className="font-semibold text-[15px] leading-none">R{product.price.toLocaleString("en-ZA")}</p>
        </div>
        <Button onClick={handleAdd} disabled={outOfStock} size="md" className="shrink-0 min-w-[132px] h-11">{outOfStock?"Out of stock":added?"Added ✓":"Add to cart"}</Button>
      </div>
    </div>
  );
}
