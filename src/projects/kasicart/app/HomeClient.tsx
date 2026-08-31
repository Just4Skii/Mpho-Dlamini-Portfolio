
import Link from "@/projects/kasicart/compat/next";
import { Product, Brand, Category } from "@/projects/kasicart/types";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { QuickView } from "@/projects/kasicart/components/product/QuickView";
import { Button } from "@/projects/kasicart/components/ui/Button";
import { useState, useEffect } from "react";
import { useRecent } from "@/projects/kasicart/store/RecentContext";
import { products as allProducts } from "@/projects/kasicart/data/products";

function Shelf({ title, eyebrow, items, onQuickView }: { title:string; eyebrow?:string; items: Product[]; onQuickView:(p:Product)=>void }) {
  return (
    <section className="py-6 sm:py-8 md:py-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-3 sm:mb-4 gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-1">{eyebrow}</p>}
            <h2 className="text-[20px] sm:text-[22px] md:text-[26px] font-semibold tracking-tight leading-none" style={{fontFamily:"var(--font-instrument)"}}>{title}</h2>
          </div>
          <Link href="/shop" className="hidden md:inline-flex h-8 px-4 rounded-full border border-[#D6CFC2] text-sm items-center hover:bg-[#11110F] hover:text-white hover:border-[#11110F] shrink-0">View all</Link>
          <Link href="/shop" className="md:hidden text-xs underline underline-offset-4 shrink-0">View all</Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-auto scrollbar-none snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-0 scroll-pl-4 md:scroll-pl-0">
          {items.map(p=>(
            <div key={p.id} className="min-w-[148px] xs:min-w-[168px] sm:min-w-[200px] md:min-w-[280px] snap-start flex-1 sm:flex-none">
              <ProductCard product={p} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeClient({ featured, newArrivals, best, trending, brands, categories, products }: { featured: Product[]; newArrivals: Product[]; best: Product[]; trending: Product[]; brands: Brand[]; categories: Category[]; products: Product[] }) {
  const [qv, setQv] = useState<Product|null>(null);
  const recentCtx = useRecent();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  useEffect(()=>{
    if (recentCtx.ids.length) {
      setRecentProducts(recentCtx.ids.map(id=> allProducts.find(p=>p.id===id)).filter(Boolean) as Product[]);
    }
  }, [recentCtx.ids]);

  return (
    <div className="pb-10">
      {qv && <QuickView product={qv} onClose={()=>setQv(null)} />}

      {/* HERO */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-8">
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-4 md:gap-6">
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-[#E8E2D8] min-h-[460px] sm:min-h-[520px] md:min-h-[640px] flex flex-col justify-end p-5 sm:p-6 md:p-10">
            <img src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1200&h=1200&fit=crop" alt="Editorial home" className="absolute inset-0 w-full h-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="relative text-white max-w-[520px]">
              <p className="text-[11px] tracking-[0.18em] uppercase text-white/80 mb-2 sm:mb-3">Independent South African brands</p>
              <h1 className="text-[34px] sm:text-[40px] md:text-[56px] font-semibold leading-[0.9] tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Good things,<br/>close to home.</h1>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-white/90 mt-3 sm:mt-4 max-w-[42ch]">Discover products from independent South African brands, makers and specialty retailers — from ceramics in Rosebank to textiles in Morningside and leather in Stellenbosch.</p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                <Link href="/shop" className="h-11 px-6 rounded-full bg-white text-[#11110F] font-medium flex items-center justify-center text-[14px] hover:bg-[#FFFBF5] active:scale-[0.98] transition">Shop the collection</Link>
                <Link href="/brands" className="h-11 px-6 rounded-full bg-white/10 backdrop-blur border border-white text-white font-medium flex items-center justify-center text-[14px] hover:bg-white hover:text-[#11110F] active:scale-[0.98] transition">Explore local brands</Link>
              </div>
              <p className="text-xs text-white/70 mt-3 sm:mt-4">Free delivery over R750 · Delivery available across South Africa</p>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4 md:gap-6">
            <div className="relative rounded-[24px] overflow-hidden bg-[#F5EEE6] min-h-[280px] flex">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop" alt="Coffee" className="absolute inset-0 w-full h-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
              <div className="absolute inset-0 bg-black/25" />
              <div className="relative p-6 flex flex-col justify-end text-white">
                <p className="text-xs tracking-widest uppercase text-white/80">From Braamfontein</p>
                <h3 className="text-[22px] font-semibold leading-tight mt-1" style={{fontFamily:"var(--font-instrument)"}}>Roasted weekly.<br/>Poured daily.</h3>
                <Link href="/category/food" className="mt-3 inline-flex h-8 px-4 rounded-full bg-white text-[#11110F] text-sm font-medium items-center w-fit">Shop coffee</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="rounded-[24px] bg-[#1E3A2E] p-6 text-[#FFFBF5] flex flex-col justify-between min-h-[200px]">
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-white/60">New this week</p>
                  <p className="text-[20px] font-semibold leading-tight mt-2" style={{fontFamily:"var(--font-instrument)"}}>Small brands<br/>doing big things.</p>
                </div>
                <Link href="/shop?sort=newest" className="h-8 px-4 rounded-full bg-white text-[#1E3A2E] text-sm font-medium inline-flex items-center w-fit">See new arrivals</Link>
              </div>
              <div className="rounded-[24px] overflow-hidden relative bg-[#E8E2D8]">
                <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop" alt="Tote" className="absolute inset-0 w-full h-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative p-5 h-full flex flex-col justify-end">
                  <span className="bg-white text-[#11110F] text-[11px] tracking-widest uppercase px-2 py-1 rounded-full w-fit">Editor&apos;s pick</span>
                  <p className="text-white font-medium mt-2 drop-shadow">Everyday Canvas Tote — R449</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-sm">
          {[
            ["Delivery across SA", "2–4 business days, tracked"],
            ["Free delivery R750+", "Standard delivery, no code needed"],
            ["Independent brands", "15+ makers from 6 cities"],
            ["Secure checkout", "Card, Instant EFT-style (UI only)"],
          ].map(([t,d])=>(
            <div key={t} className="p-4 rounded-2xl bg-white border border-[#E8E2D8] flex gap-3 items-start">
              <span className="w-8 h-8 rounded-full bg-[#F5EEE6] flex items-center justify-center shrink-0">✓</span>
              <div><p className="font-medium leading-tight">{t}</p><p className="text-xs text-stone-500">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* EDITORIAL FEATURE - asymmetric */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-10 sm:mt-12 md:mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-[24px] sm:text-[30px] md:text-[38px] font-semibold tracking-tight leading-none" style={{fontFamily:"var(--font-instrument)"}}>Made here. Chosen for you.</h2>
          <Link href="/shop" className="hidden md:inline-flex text-sm underline underline-offset-4 shrink-0">Shop curated</Link>
        </div>
        <div className="grid md:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          <Link href={`/product/${featured[0]?.slug}`} className="md:col-span-7 relative rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#F5EEE6] min-h-[420px] sm:min-h-[520px] group">
            <img src={featured[0]?.images[0]} alt={featured[0]?.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 p-6 md:p-8 text-white">
              <p className="text-xs tracking-widest uppercase text-white/80">{featured[0]?.brand} · {featured[0]?.sellerLocation}</p>
              <h3 className="text-[24px] font-semibold mt-1">{featured[0]?.name}</h3>
              <p className="text-sm text-white/90 mt-1 line-clamp-2 max-w-[40ch]">{featured[0]?.shortDescription}</p>
              <span className="inline-flex mt-3 h-9 px-5 rounded-full bg-white text-[#11110F] text-sm font-medium items-center">Shop — R{featured[0]?.price.toLocaleString("en-ZA")}</span>
            </div>
          </Link>
          <div className="md:col-span-5 grid grid-rows-2 gap-4 md:gap-6">
            {featured.slice(1,3).map(p=>(
              <Link key={p.id} href={`/product/${p.slug}`} className="relative rounded-[24px] overflow-hidden bg-[#F5EEE6] min-h-[250px] group">
                <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <p className="text-[11px] tracking-widest uppercase text-white/80">{p.brand}</p>
                  <h3 className="font-medium leading-tight">{p.name}</h3>
                  <p className="text-sm">R{p.price.toLocaleString("en-ZA")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12 md:mt-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-[26px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Shop by category</h2>
          <Link href="/shop" className="text-sm underline underline-offset-4 hidden md:inline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map(c=>(
            <Link key={c.slug} href={`/category/${c.slug}`} className="group relative rounded-[20px] overflow-hidden bg-[#F5EEE6] aspect-[4/5] md:aspect-[3/4]">
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition duration-700"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h3 className="font-medium leading-tight">{c.name}</h3>
                <p className="text-xs text-white/80 line-clamp-1">{c.subcategories.slice(0,3).join(" · ")}</p>
              </div>
              <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SHOP LOCAL */}
      <section className="mt-12 md:mt-16 bg-[#11110F] text-[#FFFBF5] py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-white/60 mb-2">Location</p>
              <h2 className="text-[30px] md:text-[38px] font-semibold leading-none" style={{fontFamily:"var(--font-instrument)"}}>From our cities to your door.</h2>
              <p className="text-sm text-white/70 mt-3 max-w-[55ch]">Explore brands by city — Johannesburg, Durban, Cape Town and Pretoria. Same delivery promise, closer story.</p>
            </div>
            <Link href="/local" className="h-10 px-6 rounded-full bg-white text-[#11110F] text-sm font-medium inline-flex items-center w-fit">Explore all cities</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { name:"Johannesburg", blurb:"Braamfontein, Rosebank, Sandton", img:"https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop" },
              { name:"Durban", blurb:"Morningside, Umhlanga, Coast", img:"https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=600&h=600&fit=crop" },
              { name:"Cape Town", blurb:"Woodstock, Sea Point, Stellenbosch", img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=600&fit=crop" },
              { name:"Pretoria", blurb:"Centurion, Botanics, Linen", img:"https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600&h=600&fit=crop" },
            ].map(c=>(
              <Link key={c.name} href={`/local#${c.name.toLowerCase().replace(" ","-")}`} className="group relative rounded-[20px] overflow-hidden aspect-[4/5] bg-zinc-800">
                <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition duration-700"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-4 text-white">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-xs text-white/70">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING / shelves */}
      <Shelf title="New this week" eyebrow="Fresh in" items={newArrivals} onQuickView={setQv} />
      <Shelf title="Trending now" eyebrow="Popular" items={trending} onQuickView={setQv} />
      <Shelf title="Best sellers" eyebrow="Most loved" items={best} onQuickView={setQv} />

      {/* RECENTLY VIEWED */}
      {recentProducts.length>0 && (
        <Shelf title="Recently viewed" eyebrow="Pick up where you left off" items={recentProducts} onQuickView={setQv} />
      )}

      {/* EDITORIAL COMMERCE HYBRID */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-[24px] bg-[#F5EEE6] p-6 md:p-8 flex flex-col justify-between min-h-[340px]">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-stone-500">Editorial</p>
            <h3 className="text-[26px] font-semibold leading-tight mt-2" style={{fontFamily:"var(--font-instrument)"}}>Objects worth<br/>keeping.</h3>
            <p className="text-sm text-stone-600 mt-3 max-w-[38ch]">A slow selection of ceramics, linen and oak — made to be used daily and held onto for years.</p>
          </div>
          <div className="flex gap-2 mt-6 flex-wrap">
            {products.filter(p=>["home","design"].includes(p.category)).slice(0,3).map(p=>(
              <Link key={p.id} href={`/product/${p.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#E8E2D8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
              </Link>
            ))}
            <Link href="/shop?category=home" className="h-10 px-5 rounded-full bg-[#11110F] text-white text-sm font-medium inline-flex items-center self-end">Shop home</Link>
          </div>
        </div>
        <div className="rounded-[24px] bg-[#1E3A2E] p-6 md:p-8 text-[#FFFBF5] flex flex-col justify-between min-h-[340px]">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-white/60">Gifting</p>
            <h3 className="text-[26px] font-semibold leading-tight mt-2" style={{fontFamily:"var(--font-instrument)"}}>Your next<br/>housewarming gift.</h3>
            <p className="text-sm text-white/70 mt-3 max-w-[38ch]">Under R500, under R750, under R1,500 — curated by budget, occasion and recipient.</p>
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/gifts?budget=500" className="h-10 px-5 rounded-full bg-white text-[#1E3A2E] text-sm font-medium inline-flex items-center">Under R500</Link>
            <Link href="/gifts?budget=750" className="h-10 px-5 rounded-full border border-white text-white text-sm font-medium inline-flex items-center">Under R750</Link>
            <Link href="/gifts" className="h-10 px-5 rounded-full border border-white/30 text-white text-sm inline-flex items-center">All gifts</Link>
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[22px] font-semibold" style={{fontFamily:"var(--font-instrument)"}}>Meet the makers</h2>
          <Link href="/brands" className="text-sm underline hidden md:inline">All brands</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.slice(0,6).map(b=>(
            <Link key={b.slug} href={`/brands/${b.slug}`} className="group p-4 rounded-2xl bg-white border border-[#E8E2D8] hover:border-[#11110F] flex gap-3 items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt={b.name} className="w-12 h-12 rounded-full object-cover"  onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop"; }} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{b.name}</p>
                <p className="text-xs text-stone-500 truncate">{b.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DISCOVER CANVAS TEASER */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12">
        <div className="rounded-[24px] bg-[#11110F] text-[#FFFBF5] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/60">Discovery-first</p>
            <h3 className="text-[24px] font-semibold leading-tight" style={{fontFamily:"var(--font-instrument)"}}>Shopping as a visual canvas</h3>
            <p className="text-sm text-white/60 mt-1 max-w-[52ch]">Shop by feeling, explore the product universe, build a room, moodboard your collection — all frontend, no backend.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/discover" className="h-9 px-5 rounded-full bg-white text-[#11110F] text-sm font-medium inline-flex items-center">Enter Discover →</Link>
              <Link href="/moodboard" className="h-9 px-5 rounded-full border border-white/20 text-white text-sm inline-flex items-center">Moodboard</Link>
              <Link href="/build-room" className="h-9 px-5 rounded-full border border-white/20 text-white text-sm inline-flex items-center">Build Room</Link>
            </div>
          </div>
          <div className="relative hidden md:flex items-center gap-2">
            {["Calm","Warm","Minimal","Giftable"].map(f=>(
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SELL CTA */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-6">
        <div className="rounded-[24px] bg-[#E8E2D8] p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-[24px] font-semibold" style={{fontFamily:"var(--font-instrument)"}}>Sell on KasiCart</h3>
            <p className="text-sm text-stone-600 mt-1 max-w-[50ch]">Reach new customers, build your storefront and grow your brand. Applications reviewed within 3–5 days.</p>
          </div>
          <Link href="/sell" className="h-11 px-7 rounded-full bg-[#11110F] text-white font-medium inline-flex items-center shrink-0">Apply to sell</Link>
        </div>
      </section>
    </div>
  );
}
