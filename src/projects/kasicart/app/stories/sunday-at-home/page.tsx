
import { useState } from "react";
import Link from "@/projects/kasicart/compat/next";
import { products } from "@/projects/kasicart/data/products";

const HOTSPOTS = [
  { id: "mug", x: 22, y: 68, slug: "umhlanga-stoneware-mug" },
  { id: "throw", x: 68, y: 34, slug: "handwoven-reversible-throw" },
  { id: "coffee", x: 48, y: 72, slug: "durban-coast-coffee-house-roast" },
  { id: "candle", x: 82, y: 74, slug: "desert-rose-candle" },
];

export default function SundayAtHomePage() {
  const [active, setActive] = useState<string | null>("mug");

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <Link href="/stories" className="text-sm underline">← All stories</Link>
      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mt-3">Sunday at home · Durban light, Johannesburg ceramics</p>
      <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>
        A slow morning, built from local pieces
      </h1>
      <p className="text-sm text-stone-600 mt-1 max-w-[60ch]">Editorial composition — hover each product overlay to see name + price, click to view. Commerce embedded in story, not a banner.</p>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
        <div className="relative bg-[#F5EEE6] rounded-[24px] overflow-hidden aspect-[4/3] group">
          <img
            src="https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1200&h=900&fit=crop"
            alt="Sunday at home lifestyle"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition" />
          {HOTSPOTS.map(h => {
            const p = products.find(x => x.slug === h.slug);
            if (!p) return null;
            const isActive = active === h.id;
            return (
              <button
                key={h.id}
                onMouseEnter={() => setActive(h.id)}
                onClick={() => setActive(h.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <span className={`w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center shadow-lg ${isActive ? "border-[#11110F] scale-110" : "border-white"} transition`}>
                  <span className="w-2 h-2 rounded-full bg-[#11110F]" />
                </span>
                {isActive && (
                  <span className="absolute left-1/2 -translate-x-1/2 top-8 whitespace-nowrap bg-[#11110F] text-white text-xs px-2.5 py-1.5 rounded-full shadow-xl">
                    {p.name} · R{p.price.toLocaleString("en-ZA")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {HOTSPOTS.map(h => {
            const p = products.find(x => x.slug === h.slug);
            if (!p) return null;
            const isActive = active === h.id;
            return (
              <Link
                key={h.id}
                href={`/product/${p.slug}`}
                onMouseEnter={() => setActive(h.id)}
                className={`flex gap-3 p-3 rounded-[16px] border bg-white hover:border-[#11110F] transition ${isActive ? "border-[#11110F] ring-1 ring-[#11110F]" : "border-[#E8E2D8]"}`}
              >
                <img src={p.images[0]} alt={p.name} className="w-20 h-20 rounded-xl object-cover bg-[#F5EEE6] shrink-0" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{p.name}</p>
                  <p className="text-xs text-stone-500">{p.brand} · R{p.price.toLocaleString("en-ZA")}</p>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-1">{p.shortDescription}</p>
                  <span className="inline-flex mt-2 text-xs px-2.5 py-1 rounded-full bg-[#11110F] text-white">View →</span>
                </div>
              </Link>
            );
          })}
          <Link href="/shop?category=home" className="block text-center text-sm underline mt-2">Shop all home →</Link>
        </div>
      </div>
    </div>
  );
}
