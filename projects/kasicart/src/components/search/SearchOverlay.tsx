
import { useState, useMemo, useEffect } from "react";
import { searchProducts } from "@/projects/kasicart/lib/search";
import { products } from "@/projects/kasicart/data/products";
import { brands } from "@/projects/kasicart/data/brands";
import Link from "@/projects/kasicart/compat/next";

const POPULAR = ["mug", "linen", "coffee", "tote", "candle", "oak desk"];
const RECENT_KEY = "kasicart_recent_searches";

export function SearchOverlay({ onClose }: { onClose: ()=>void }) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const results = useMemo(()=> searchProducts(q).slice(0,6), [q]);
  const brandMatches = useMemo(()=> q ? brands.filter(b=> b.name.toLowerCase().includes(q.toLowerCase())).slice(0,3) : [], [q]);

  useEffect(()=>{
    try { const raw = localStorage.getItem(RECENT_KEY); if(raw) setRecent(JSON.parse(raw)); } catch {}
  },[]);
  const pushRecent = (term: string) => {
    if(!term.trim()) return;
    const next = [term, ...recent.filter(x=>x!==term)].slice(0,5);
    setRecent(next);
    try{ localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <button aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-[#FFFBF5] w-full h-[100dvh] md:h-auto md:max-w-[720px] md:mx-auto md:mt-10 md:rounded-[20px] rounded-none shadow-2xl overflow-hidden md:max-h-[88vh] flex flex-col">
        <div className="p-4 border-b border-[#E8E2D8] flex items-center gap-3">
          <span className="text-stone-400">⌕</span>
          <input
            autoFocus
            value={q}
            onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter" && q) pushRecent(q); }}
            placeholder="Search products, brands, categories…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-stone-400"
          />
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#11110F] text-white flex items-center justify-center text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-5 overscroll-contain">
          {!q && (
            <>
              {recent.length>0 && (
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-2">Recent searches</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {recent.map(r=>(
                      <button key={r} onClick={()=>setQ(r)} className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D8] text-sm hover:border-[#11110F] active:scale-95 transition">{r}</button>
                    ))}
                    <button onClick={()=>{ setRecent([]); try{localStorage.removeItem(RECENT_KEY);}catch{}}} className="text-xs underline px-2">Clear</button>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-2">Popular searches</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {POPULAR.map(p=>(
                    <button key={p} onClick={()=>{ setQ(p); pushRecent(p); }} className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D8] text-sm hover:border-[#11110F] active:scale-95 transition">{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-2">Trending categories</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {[
                    ["Home & Living","home"],["Fashion","fashion"],["Beauty","beauty"],
                    ["Food","food"],["Design","design"],["Tech","tech"]
                  ].map(([label, slug])=>(
                    <Link key={label} href={`/shop?category=${slug}`} onClick={onClose} className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E8E2D8] text-sm hover:border-[#11110F] hover:bg-[#F5EEE6] text-center sm:text-left transition">{label}</Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {q && (
            <>
              {results.length===0 && brandMatches.length===0 ? (
                <div className="py-10 text-center">
                  <p className="font-medium">Nothing matched that search.</p>
                  <p className="text-sm text-stone-500 mt-1">Try a different term or browse popular categories.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {POPULAR.map(p=>(
                      <button key={p} onClick={()=>setQ(p)} className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D8] text-sm">{p}</button>
                    ))}
                  </div>
                  <Link href="/shop" onClick={onClose} className="inline-block mt-4 text-sm underline">Clear and browse all</Link>
                </div>
              ) : (
                <>
                  {brandMatches.length>0 && (
                    <div>
                      <p className="text-[11px] tracking-widest uppercase text-stone-500 mb-2">Brands</p>
                      <div className="space-y-2">
                        {brandMatches.map(b=>(
                          <Link key={b.slug} href={`/brands/${b.slug}`} onClick={()=>{ pushRecent(q); onClose(); }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E2D8]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={b.image} alt={b.name} className="w-10 h-10 rounded-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                            <div>
                              <p className="text-sm font-medium">{b.name}</p>
                              <p className="text-xs text-stone-500">{b.location} · {b.tagline}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.length>0 && (
                    <div>
                      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-2">Products — {results.length} results</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {results.map(p=>(
                          <Link key={p.id} href={`/product/${p.slug}`} onClick={()=>{ pushRecent(q); onClose(); }} className="flex gap-3 p-2.5 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#11110F] hover:shadow-sm transition">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover bg-[#F5EEE6] shrink-0"
                              loading="lazy"
                              onError={(e)=> { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight line-clamp-2">{p.name}</p>
                              <p className="text-xs text-stone-500 truncate">{p.brand} · R{p.price.toLocaleString("en-ZA")}</p>
                              <p className="text-[11px] text-stone-400 truncate">{p.tags.slice(0,3).join(" · ")}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <Link href={`/shop?search=${encodeURIComponent(q)}`} onClick={()=>{ pushRecent(q); onClose(); }} className="block text-center text-sm font-medium mt-4 h-11 rounded-full bg-[#11110F] text-white flex items-center justify-center hover:bg-black active:scale-[0.98] transition">View all results for “{q}”</Link>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        <div className="p-3 bg-[#F5EEE6] text-center text-xs text-stone-500">Press <span className="px-1.5 py-0.5 bg-white rounded border">Esc</span> to close · <span className="px-1.5 py-0.5 bg-white rounded border">⌘ K</span> to open</div>
      </div>
    </div>
  );
}
