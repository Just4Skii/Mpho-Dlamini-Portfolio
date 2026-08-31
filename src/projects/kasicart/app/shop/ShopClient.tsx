import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "@/projects/kasicart/compat/next";
import { products } from "@/projects/kasicart/data/products";
import { categories } from "@/projects/kasicart/data/categories";
import { brands } from "@/projects/kasicart/data/brands";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { QuickView } from "@/projects/kasicart/components/product/QuickView";
import { Product,  } from "@/projects/kasicart/types";
import { searchProducts } from "@/projects/kasicart/lib/search";
import { PriceSpectrum } from "@/projects/kasicart/components/filters/PriceSpectrum";

type Sort = "featured"|"newest"|"price-low"|"price-high"|"rated";

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [qv, setQv] = useState<Product|null>(null);
  const [view, setView] = useState<"grid"|"compact">("grid");
  const [mobileFilters, setMobileFilters] = useState(false);

  // read from URL
  const q = searchParams.get("search") || "";
  const cat = searchParams.get("category") || "";
  const sub = searchParams.get("subcategory") || "";
  const brandParam = searchParams.get("brand") || "";
  const colorParam = searchParams.get("color") || "";
  const sizeParam = searchParams.get("size") || "";
  const avail = searchParams.get("availability") || "";
  const ratingParam = searchParams.get("rating") || "";
  const priceMin = Number(searchParams.get("priceMin") || 0);
  const priceMax = Number(searchParams.get("priceMax") || 999999);
  const sort: Sort = (searchParams.get("sort") as Sort) || "featured";
  const city = searchParams.get("city") || "";

  const [localSearch, setLocalSearch] = useState(q);
  useEffect(()=>setLocalSearch(q), [q]);

  const update = (patch: Record<string,string|undefined>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k,v] of Object.entries(patch)) {
      if (!v) p.delete(k); else p.set(k, v);
    }
    router.push(`/shop?${p.toString()}`);
  };

  const filtered = useMemo(()=>{
    let list = [...products];
    if (q) {
      const ids = new Set(searchProducts(q).map(p=>p.id));
      list = list.filter(p=>ids.has(p.id));
    }
    if (cat) {
      const c = categories.find(x=> x.slug===cat || x.name.toLowerCase()===cat.toLowerCase());
      const catKey = c ? c.slug : cat.toLowerCase();
      // map slug to stored category field (home,fashion etc)
      list = list.filter(p=> p.category===catKey);
    }
    if (sub) list = list.filter(p=> p.subcategory.toLowerCase()===sub.toLowerCase());
    if (brandParam) list = list.filter(p=> p.brandSlug===brandParam);
    if (city) list = list.filter(p=> p.sellerLocation.toLowerCase().includes(city.toLowerCase()));
    if (colorParam) list = list.filter(p=> p.colors?.some(c=> c.name.toLowerCase()===colorParam.toLowerCase()));
    if (sizeParam) list = list.filter(p=> p.sizes?.includes(sizeParam) || p.variants.some(v=> v.size===sizeParam));
    if (avail) list = list.filter(p=> p.stockStatus===avail);
    if (ratingParam) list = list.filter(p=> p.rating >= Number(ratingParam));
    list = list.filter(p=> p.price >= priceMin && p.price <= priceMax);

    // sort
    if (sort==="price-low") list.sort((a,b)=>a.price-b.price);
    else if (sort==="price-high") list.sort((a,b)=>b.price-a.price);
    else if (sort==="newest") list.sort((a,b)=> (b.newArrival?1:0)-(a.newArrival?1:0));
    else if (sort==="rated") list.sort((a,b)=>b.rating-a.rating);
    else if (sort==="featured") list.sort((a,b)=> (b.featured?1:0)-(a.featured?1:0));

    return list;
  }, [q, cat, sub, brandParam, colorParam, sizeParam, avail, ratingParam, priceMin, priceMax, sort, city]);

  const activeCount = [cat, sub, brandParam, colorParam, sizeParam, avail, ratingParam, city, priceMin? "price":"", priceMax!==999999?"price":""].filter(Boolean).length + (q?1:0);

  const clearAll = () => router.push("/shop");

  // pagination - simple
  const [page, setPage] = useState(1);
  useEffect(()=> setPage(1), [filtered.length]);
  const perPage = view==="compact" ? 20 : 16;
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  const FilterPanel = ({ mobile=false }: { mobile?: boolean }) => (
    <div className={`space-y-6 ${mobile?"p-6":""}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters {activeCount>0 && <span className="ml-2 bg-[#11110F] text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>}</h3>
        {activeCount>0 && <button onClick={clearAll} className="text-xs underline">Clear all</button>}
      </div>

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Category</p>
        <div className="space-y-1">
          {categories.map(c=>(
            <button key={c.slug} onClick={()=> update({ category: cat===c.slug? undefined : c.slug, subcategory: undefined })} className={`block w-full text-left text-sm px-3 py-1.5 rounded-full ${cat===c.slug ? "bg-[#11110F] text-white":"hover:bg-white border border-transparent hover:border-[#E8E2D8] bg-white border border-[#E8E2D8]"}`}>{c.name}</button>
          ))}
        </div>
        {cat && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(categories.find(c=>c.slug===cat)?.subcategories || []).map(s=>(
              <button key={s} onClick={()=> update({ subcategory: sub===s? undefined : s })} className={`text-xs px-3 py-1 rounded-full border ${sub===s?"bg-[#C45D3C] text-white border-[#C45D3C]":"bg-white border-[#E8E2D8]"}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div>
        <PriceSpectrum
          value={[priceMin, priceMax===999999?5000:priceMax]}
          onChange={([min,max]) => update({ priceMin: min ? String(min) : undefined, priceMax: max===5000? undefined : String(max) })}
          count={filtered.length}
        />
      </div>

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Brand</p>
        <div className="space-y-1.5">
          {brands.slice(0,8).map(b=>(
            <label key={b.slug} className="flex items-center gap-2.5 text-sm p-1.5 rounded-lg hover:bg-[#F5EEE6] cursor-pointer">
              <input type="checkbox" checked={brandParam===b.slug} onChange={()=> update({ brand: brandParam===b.slug? undefined : b.slug })} className="rounded w-4 h-4 accent-[#11110F]" />
              {b.name}
            </label>
          ))}
          {brands.length > 8 && (
            <details className="group">
              <summary className="text-xs text-stone-500 underline underline-offset-4 cursor-pointer list-none py-1">Show {brands.length - 8} more</summary>
              <div className="space-y-1.5 mt-1">
                {brands.slice(8,12).map(b=>(
                  <label key={b.slug} className="flex items-center gap-2.5 text-sm p-1.5 rounded-lg hover:bg-[#F5EEE6] cursor-pointer">
                    <input type="checkbox" checked={brandParam===b.slug} onChange={()=> update({ brand: brandParam===b.slug? undefined : b.slug })} className="rounded w-4 h-4 accent-[#11110F]" />
                    {b.name}
                  </label>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">City</p>
          <select value={city} onChange={e=> update({ city: e.target.value || undefined })} className="w-full h-9 rounded-full border border-[#E8E2D8] px-3 text-sm bg-white">
            <option value="">Any</option>
            <option value="Johannesburg">Johannesburg</option>
            <option value="Durban">Durban</option>
            <option value="Cape Town">Cape Town</option>
            <option value="Pretoria">Pretoria</option>
            <option value="Gqeberha">Gqeberha</option>
            <option value="Bloemfontein">Bloemfontein</option>
          </select>
        </div>
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Rating</p>
          <select value={ratingParam} onChange={e=> update({ rating: e.target.value || undefined })} className="w-full h-9 rounded-full border border-[#E8E2D8] px-3 text-sm bg-white">
            <option value="">Any</option>
            <option value="4.5">4.5+ stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Availability</p>
        <div className="flex gap-2 flex-wrap">
          {[
            ["in-stock","In stock"],
            ["low-stock","Low stock"],
            ["out-of-stock","Out of stock"],
            ["pre-order","Pre-order"],
          ].map(([v,l])=>(
            <button key={v} onClick={()=> update({ availability: avail===v? undefined : v })} className={`text-xs px-3 py-1.5 rounded-full border ${avail===v?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {["Black","Cream","Terracotta","Sand","Oat","Charcoal","White","Clay","Olive","Natural","Sage","Walnut","Tan"].map(c=>(
            <button key={c} onClick={()=> update({ color: colorParam===c? undefined : c })} className={`text-xs px-3 py-1.5 rounded-full border ${colorParam===c?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs tracking-widest uppercase text-stone-500 mb-2">Size</p>
        <div className="flex gap-2 flex-wrap">
          {["S","M","L","XL","250g","500g","13in","16in"].map(s=>(
            <button key={s} onClick={()=> update({ size: sizeParam===s? undefined : s })} className={`text-xs px-3 py-1.5 rounded-full border ${sizeParam===s?"bg-[#11110F] text-white border-[#11110F]":"bg-white border-[#E8E2D8]"}`}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
      {qv && <QuickView product={qv} onClose={()=>setQv(null)} />}

      {/* breadcrumb */}
      <div className="text-xs text-stone-500 flex items-center gap-1 mb-4">
        <a href="/" className="hover:underline">Home</a> <span>/</span> <span className="text-[#11110F] font-medium">Shop</span>
        {cat && <> <span>/</span> <span className="capitalize">{cat}</span></>}
        {q && <> <span>/</span> <span>Search “{q}”</span></>}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>{q ? `Search: “${q}”` : cat ? categories.find(c=>c.slug===cat)?.name || cat : "Shop the collection"}</h1>
          <p className="text-sm text-stone-600 mt-1">{filtered.length} products · {categories.find(c=>c.slug===cat)?.heroCopy?.slice(0,90) || "Discovery-driven marketplace for independent South African brands."}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* search in shop */}
          <div className="flex items-center gap-2 h-10 px-3 rounded-full bg-white border border-[#E8E2D8] w-full md:w-[280px]">
            <span className="text-stone-400">⌕</span>
            <input value={localSearch} onChange={e=>setLocalSearch(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") update({ search: localSearch || undefined }); }} placeholder="Search shop…" className="flex-1 outline-none text-sm" />
            {localSearch && <button onClick={()=>{ setLocalSearch(""); update({ search: undefined }); }} className="text-xs">✕</button>}
            <button onClick={()=> update({ search: localSearch || undefined })} className="h-7 px-3 rounded-full bg-[#11110F] text-white text-xs">Search</button>
          </div>
        </div>
      </div>

      {/* active filters chips */}
      {activeCount>0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {q && <span className="px-3 py-1 rounded-full bg-[#11110F] text-white text-xs">Search: {q} <button onClick={()=>update({search:undefined})} className="ml-1">✕</button></span>}
          {cat && <span className="px-3 py-1 rounded-full bg-white border border-[#E8E2D8] text-xs">Category: {cat} <button onClick={()=>update({category:undefined, subcategory:undefined})} className="ml-1">✕</button></span>}
          {sub && <span className="px-3 py-1 rounded-full bg-white border border-[#E8E2D8] text-xs">{sub} <button onClick={()=>update({subcategory:undefined})} className="ml-1">✕</button></span>}
          {brandParam && <span className="px-3 py-1 rounded-full bg-white border border-[#E8E2D8] text-xs">{brandParam} <button onClick={()=>update({brand:undefined})} className="ml-1">✕</button></span>}
          <button onClick={clearAll} className="text-xs underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* desktop sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-[76px] bg-white border border-[#E8E2D8] rounded-[20px] p-5 max-h-[calc(100vh-90px)] overflow-auto">
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* toolbar */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 bg-white border border-[#E8E2D8] rounded-full p-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <button onClick={()=>setMobileFilters(true)} className="lg:hidden h-10 sm:h-8 px-4 rounded-full bg-[#11110F] text-white text-sm font-medium shrink-0 active:scale-95 transition">Filters {activeCount>0 && `(${activeCount})`}</button>
              <span className="hidden md:inline text-sm text-stone-600 px-3 truncate">{filtered.length} results</span>
              <span className="md:hidden text-sm text-stone-600 px-1 sm:px-2 truncate">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <select value={sort} onChange={e=> update({ sort: e.target.value })} className="h-10 sm:h-8 rounded-full border border-[#E8E2D8] bg-white px-2 sm:px-3 text-xs sm:text-sm min-w-[118px]">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rated">Highest rated</option>
              </select>
              <div className="hidden md:flex rounded-full border border-[#E8E2D8] overflow-hidden">
                <button onClick={()=>setView("grid")} className={`h-8 px-3 text-sm ${view==="grid"?"bg-[#11110F] text-white":"bg-white"}`}>Grid</button>
                <button onClick={()=>setView("compact")} className={`h-8 px-3 text-sm ${view==="compact"?"bg-[#11110F] text-white":"bg-white"}`}>Compact</button>
              </div>
            </div>
          </div>

          {/* results */}
          {pageItems.length===0 ? (
            <div className="py-16 text-center bg-white border border-[#E8E2D8] rounded-[20px]">
              <p className="font-medium text-lg">Nothing matched that search.</p>
              <p className="text-sm text-stone-500 mt-1">Try adjusting filters or search for something else.</p>
              <div className="flex gap-2 justify-center mt-4">
                <button onClick={clearAll} className="h-10 px-6 rounded-full bg-[#11110F] text-white text-sm">Clear filters</button>
                <a href="/shop" className="h-10 px-6 rounded-full border border-[#E8E2D8] flex items-center text-sm">Browse all</a>
              </div>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-2xl mx-auto px-6">
                <a href="/shop?category=home" className="p-4 rounded-xl bg-[#F5EEE6] text-sm">Home & Living →</a>
                <a href="/shop?category=fashion" className="p-4 rounded-xl bg-[#F5EEE6] text-sm">Fashion →</a>
                <a href="/shop?category=beauty" className="p-4 rounded-xl bg-[#F5EEE6] text-sm">Beauty →</a>
                <a href="/shop?category=food" className="p-4 rounded-xl bg-[#F5EEE6] text-sm">Food →</a>
              </div>
            </div>
          ) : (
            <>
              <div className={view==="compact" ? "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" : "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"}>
                {pageItems.map(p=>(
                  <ProductCard key={p.id} product={p} onQuickView={setQv} />
                ))}
              </div>

              {/* pagination */}
              {totalPages>1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="h-9 px-4 rounded-full border border-[#E8E2D8] bg-white disabled:opacity-40 text-sm">Previous</button>
                  <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
                  <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="h-9 px-4 rounded-full border border-[#E8E2D8] bg-white disabled:opacity-40 text-sm">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer — full-screen on mobile */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          <button className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setMobileFilters(false)} aria-label="Close filters" />
          <div className="relative bg-[#FFFBF5] w-full sm:max-w-[380px] h-[100dvh] flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-[#FFFBF5] p-4 border-b border-[#E8E2D8] flex items-center justify-between shrink-0">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={()=>setMobileFilters(false)} className="w-10 h-10 rounded-full bg-[#11110F] text-white flex items-center justify-center active:scale-95 transition">✕</button>
            </div>
            <div className="flex-1 overflow-auto">
              <FilterPanel mobile />
            </div>
            <div className="sticky bottom-0 bg-[#FFFBF5] p-4 border-t border-[#E8E2D8] flex gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
              <button onClick={()=>setMobileFilters(false)} className="flex-1 h-12 rounded-full bg-[#11110F] text-white font-medium active:scale-[0.98] transition">Show {filtered.length} results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
