import { useState } from "react";
import { products } from "@/projects/kasicart/data/products";
import Link from "@/projects/kasicart/compat/next";

const LOOK_POOL = [
  "soft-cotton-hoodie-oat",
  "cotton-poplin-shirt-white",
  "oversized-linen-shirt-sand",
  "everyday-canvas-tote",
  "leather-tote-black",
  "wool-beanie-charcoal",
  "sling-bag-black-ripstop",
  "leather-card-holder-tan",
].map(slug => products.find(p => p.slug === slug)!).filter(Boolean);

export default function BuildLookPage() {
  const [look, setLook] = useState<string[]>(["soft-cotton-hoodie-oat", "everyday-canvas-tote", "wool-beanie-charcoal"]);

  const toggle = (slug: string) => setLook(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug].slice(0, 5));
  const scene = look.map(slug => products.find(p => p.slug === slug)!).filter(Boolean);
  const total = scene.reduce((s, p) => s + p.price, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Complete the look · Editorial styling</p>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>
        Build the look — shirt to bag, one composition
      </h1>
      <p className="text-sm text-stone-600 mt-1 max-w-[60ch]">Select a product, generate a styled collection. Swap, remove, add all to cart. No hard jump — products animate into a single editorial composition.</p>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-6">
        <div className="bg-[#11110F] rounded-[24px] p-5 sm:p-6 text-[#FFFBF5] min-h-[420px] sm:min-h-[480px] flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">The composition</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/10">{scene.length} pieces</span>
          </div>

          <div className="flex-1 mt-4 bg-[#1a1a1a] rounded-[16px] p-4 grid grid-cols-3 gap-3 content-center border border-white/10">
            {scene.length === 0 ? (
              <p className="col-span-3 text-sm text-white/60 text-center">Pick pieces on the right to build the look.</p>
            ) : (
              scene.map(p => (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden text-[#11110F] group">
                  <div className="aspect-[3/4] bg-[#F5EEE6] overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium leading-tight truncate">{p.name}</p>
                    <p className="text-[11px] text-stone-500">R{p.price.toLocaleString("en-ZA")}</p>
                  </div>
                </div>
              ))
            )}
            {/* ghost slots */}
            {Array.from({ length: Math.max(0, 3 - scene.length) }).map((_, i) => (
              <div key={`ghost-${i}`} className="border-2 border-dashed border-white/15 rounded-xl aspect-[3/4] flex items-center justify-center text-white/30 text-xs">Empty</div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm">Total R{total.toLocaleString("en-ZA")}</span>
            <span className="text-white/40">·</span>
            <button className="h-9 px-4 rounded-full bg-white text-[#11110F] text-sm font-medium hover:bg-[#F5EEE6]">Add all to cart (demo)</button>
            <button onClick={() => setLook([])} className="h-9 px-4 rounded-full border border-white/20 text-sm">Clear</button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Pick pieces</h3>
          <div className="grid grid-cols-2 gap-3">
            {LOOK_POOL.map(p => {
              const active = look.includes(p.slug);
              return (
                <button key={p.id} onClick={() => toggle(p.slug)} className={`text-left rounded-[16px] overflow-hidden border bg-white ${active ? "border-[#C45D3C] ring-1 ring-[#C45D3C]" : "border-[#E8E2D8] hover:border-[#11110F]"}`}>
                  <div className="aspect-[4/5] bg-[#F5EEE6] overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-stone-500">R{p.price.toLocaleString("en-ZA")}</p>
                    <span className={`inline-flex mt-2 text-xs px-2.5 py-1 rounded-full ${active ? "bg-[#C45D3C] text-white" : "bg-white border border-[#E8E2D8]"}`}>{active ? "✓ In look" : "+ Add"}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <Link href="/shop?category=fashion" className="inline-flex mt-4 text-sm underline">Shop all fashion →</Link>
        </div>
      </div>
    </div>
  );
}
