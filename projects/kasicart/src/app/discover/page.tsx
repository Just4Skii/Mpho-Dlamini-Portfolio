import { useState, useMemo } from "react";
import Link from "@/projects/kasicart/compat/next";
import { products } from "@/projects/kasicart/data/products";
import { feelings, productsForFeeling } from "@/projects/kasicart/data/feelings";
import { FeelingBar } from "@/projects/kasicart/components/discovery/FeelingBar";
import { ProductUniverse } from "@/projects/kasicart/components/discovery/ProductUniverse";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";
import { QuickView } from "@/projects/kasicart/components/product/QuickView";
import { PriceSpectrum } from "@/projects/kasicart/components/filters/PriceSpectrum";
import { Product } from "@/projects/kasicart/types";

export default function DiscoverPage() {
  const [feeling, setFeeling] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [price, setPrice] = useState<[number, number]>([0, 5000]);
  const [qv, setQv] = useState<Product | null>(null);
  const [surprise, setSurprise] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = feeling ? productsForFeeling(feeling, products) : [...products];
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(p => `${p.name} ${p.tags.join(" ")} ${p.brand}`.toLowerCase().includes(qq));
    }
    list = list.filter(p => p.price >= price[0] && p.price <= price[1]);
    return list;
  }, [feeling, q, price]);

  const handleSurprise = () => {
    const pool = filtered.length ? filtered : products;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurprise(pick);
    setTimeout(() => setSurprise(null), 2200);
    // scroll to it
    setTimeout(() => {
      document.getElementById(`prod-${pick.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      {qv && <QuickView product={qv} onClose={() => setQv(null)} />}

      {/* visual canvas hero */}
      <div className="rounded-[24px] bg-[#11110F] text-[#FFFBF5] p-6 sm:p-8 md:p-10 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/60">Discovery-first</p>
          <h1 className="text-[28px] sm:text-[36px] md:text-[48px] font-semibold leading-[0.9] tracking-tight mt-2" style={{ fontFamily: "var(--font-instrument)" }}>
            Find something<br />worth keeping.
          </h1>
          <p className="text-sm sm:text-[15px] text-white/70 mt-3 max-w-[52ch]">Not just browse → product → cart. Discover → explore → compare → curate → build a collection → buy. Hover, drift, and let complementary pieces move closer.</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 h-11 px-4 rounded-full bg-white text-[#11110F]">
              <span className="text-stone-400">⌕</span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by feeling, material, brand…" className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone-400" />
              {q && <button onClick={() => setQ("")} className="text-xs px-2 py-1 rounded-full bg-[#E8E2D8]">Clear</button>}
            </div>
            <button onClick={handleSurprise} className="h-11 px-6 rounded-full bg-[#C45D3C] text-white text-sm font-medium hover:bg-[#A84E32] active:scale-[0.98] transition shrink-0">
              ✨ Surprise me
            </button>
          </div>

          <div className="mt-6">
            <p className="text-xs tracking-widest uppercase text-white/50 mb-2">Shop by feeling — KasiCart signature</p>
            <FeelingBar active={feeling} onSelect={setFeeling} />
            {feeling && (
              <p className="text-xs text-white/60 mt-2">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: feelings.find(f=>f.id===feeling)?.color }} />{feelings.find(f=>f.id===feeling)?.blurb}</span>
                <span className="mx-2">·</span>Curated metadata — not AI. Transparent rules.
              </p>
            )}
          </div>
        </div>

        {surprise && (
          <div className="absolute inset-0 bg-[#11110F]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white rounded-[20px] p-5 max-w-[360px] w-full text-[#11110F] text-center">
              <p className="text-xs tracking-widest uppercase text-stone-500">Surprise pick</p>
              <img src={surprise.images[0]} alt={surprise.name} className="w-full aspect-[4/3] object-cover rounded-xl mt-3 bg-[#F5EEE6]" />
              <h3 className="font-semibold mt-3">{surprise.name}</h3>
              <p className="text-sm text-stone-500">{surprise.brand} · R{surprise.price.toLocaleString("en-ZA")}</p>
            </div>
          </div>
        )}
      </div>

      {/* visual canvas grid — products drift */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{feeling ? feelings.find(f=>f.id===feeling)?.label : "All feelings"} · {filtered.length} pieces</h2>
          <span className="text-xs text-stone-500 hidden sm:inline">Hover to enlarge • Related pieces drift closer (desktop)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filtered.slice(0, 16).map(p => (
            <div key={p.id} id={`prod-${p.id}`} className="group relative transition-all duration-500 hover:z-10 hover:scale-[1.02] hover:-rotate-[0.3deg]">
              <div className="absolute -inset-2 bg-[#F5EEE6] rounded-[20px] opacity-0 group-hover:opacity-100 transition -z-10" />
              <ProductCard product={p} onQuickView={setQv} />
              <div className="hidden sm:block absolute inset-x-0 -bottom-1 h-8 bg-gradient-to-t from-[#FFFBF5] to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center py-10 text-stone-500">No pieces match that feeling + price. Try relaxing the spectrum.</p>}
      </div>

      {/* price spectrum */}
      <div className="mt-8 p-5 sm:p-6 rounded-[20px] bg-white border border-[#E8E2D8]">
        <PriceSpectrum value={price} onChange={setPrice} count={filtered.length} />
      </div>

      {/* universe */}
      <div className="mt-8">
        <ProductUniverse onSelect={id => { const map: Record<string,string> = { home:"home", fashion:"fashion", beauty:"beauty", food:"food", design:"design", tech:"tech"}; window.location.href = `/category/${map[id] || id}`; }} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/build-room" className="h-10 px-5 rounded-full bg-[#11110F] text-white text-sm font-medium inline-flex items-center">Build your room →</Link>
        <Link href="/build-look" className="h-10 px-5 rounded-full bg-white border border-[#E8E2D8] text-sm font-medium inline-flex items-center">Build the look →</Link>
        <Link href="/moodboard" className="h-10 px-5 rounded-full bg-white border border-[#E8E2D8] text-sm font-medium inline-flex items-center">Moodboard →</Link>
      </div>
    </div>
  );
}
