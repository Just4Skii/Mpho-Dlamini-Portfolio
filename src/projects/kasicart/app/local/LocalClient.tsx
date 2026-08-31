import { useState } from "react";
import { cities } from "@/projects/kasicart/data/categories";
import { brands } from "@/projects/kasicart/data/brands";
import { products } from "@/projects/kasicart/data/products";
import Link from "@/projects/kasicart/compat/next";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";

export function LocalClient() {
  const [active, setActive] = useState(cities[0].slug);

  const city = cities.find(c => c.slug === active) || cities[0];
  const cityBrands = brands.filter(b => b.city.toLowerCase() === city.name.toLowerCase() || b.location.toLowerCase().includes(city.name.toLowerCase()));
  const cityProducts = products.filter(p => p.sellerLocation.toLowerCase().includes(city.name.toLowerCase())).slice(0, 8);

  return (
    <div>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
        <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Made near you · First-class local</p>
        <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>
          Find great products from your city.
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-[60ch]">Choose a city — products and brands animate into view. No reload, just transition. Local identity integrated into functionality.</p>

        <div className="flex gap-2 overflow-auto scrollbar-none snap-x pb-2 mt-5 -mx-4 px-4 md:mx-0 md:px-0">
          {cities.map(c => (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className={`shrink-0 snap-start h-11 px-5 rounded-full border text-sm font-medium flex items-center gap-2 transition ${active === c.slug ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}
            >
              <span className={`w-2 h-2 rounded-full ${active === c.slug ? "bg-[#C45D3C]" : "bg-[#E8E2D8]"}`} />
              {c.name}
            </button>
          ))}
        </div>

        {/* animated transition */}
        <div key={active} className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid md:grid-cols-[380px_1fr] gap-6">
            <div className="relative rounded-[24px] overflow-hidden h-[360px] sm:h-[420px] bg-[#F5EEE6]">
              <img src={city.image} alt={city.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=600&fit=crop"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <h2 className="text-[26px] font-semibold leading-none">{city.name}</h2>
                <p className="text-sm text-white/80 mt-1">{city.blurb}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-white text-[#11110F]">{cityBrands.length} local brands</span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur border border-white/20">{cityProducts.length * 9}+ products</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <h3 className="font-semibold">Local brands — {city.name}</h3>
                <Link href={`/shop?city=${encodeURIComponent(city.name)}`} className="text-xs underline">Shop {city.name} →</Link>
              </div>
              <div className="flex gap-3 overflow-auto scrollbar-none pb-2 mt-3 snap-x">
                {cityBrands.length ? (
                  cityBrands.map(b => (
                    <Link key={b.slug} href={`/brands/${b.slug}`} className="shrink-0 snap-start flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E8E2D8] min-w-[220px] hover:border-[#11110F]">
                      <img src={b.image} alt={b.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-stone-500 truncate max-w-[140px]">{b.tagline}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-stone-500">No dedicated brand page yet — but products ship from here.</p>
                )}
              </div>

              <h3 className="font-semibold mt-6">Popular products · Made near you</h3>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {cityProducts.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#F5EEE6] border border-[#E8E2D8] text-sm">
                <p className="font-medium">Made in {city.name}</p>
                <p className="text-stone-600">Large image, brand story, featured collection — editorial modules celebrate local making without stereotypes. City transition animates title, shelf, and imagery.</p>
                <Link href={`/shop?city=${encodeURIComponent(city.name)}`} className="inline-flex mt-3 h-9 px-5 rounded-full bg-[#11110F] text-white text-xs items-center">Explore the collection</Link>
              </div>
            </div>
          </div>
        </div>

        {/* all cities muted list */}
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {cities.map(c => (
            <button key={c.slug} onClick={() => setActive(c.slug)} className={`text-left p-3 rounded-xl border flex items-center gap-3 ${active === c.slug ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}>
              <img src={c.image} alt={c.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
              <span className="text-sm font-medium">{c.name}</span>
              <span className="ml-auto text-xs opacity-60">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
