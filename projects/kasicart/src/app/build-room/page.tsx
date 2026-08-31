import { useState } from "react";
import { products } from "@/projects/kasicart/data/products";
import Link from "@/projects/kasicart/compat/next";

type Room = "Living room" | "Bedroom" | "Workspace" | "Kitchen";

const ROOM_PRODUCTS: Record<Room, string[]> = {
  "Living room": ["handwoven-reversible-throw", "clayline-serving-bowl", "pendant-light-raw-linen", "ceramic-vase-ash"],
  "Bedroom": ["washed-linen-duvet-set", "linen-cushion-terracotta", "desert-rose-candle", "sheer-linen-curtain"],
  "Workspace": ["compact-oak-desk-120cm", "oak-desk-organiser", "desk-lamp-mat-black", "minimal-steel-bookshelf"],
  "Kitchen": ["umhlanga-stoneware-mug", "walnut-cutting-board", "stoneware-planter-large", "oak-cutting-board-small"],
};

export default function BuildRoomPage() {
  const [room, setRoom] = useState<Room>("Living room");
  const [placed, setPlaced] = useState<string[]>([]);

  const pool = ROOM_PRODUCTS[room].map(slug => products.find(p => p.slug === slug)!).filter(Boolean);
  const scene = placed.map(slug => products.find(p => p.slug === slug)!).filter(Boolean);

  const toggle = (slug: string) => setPlaced(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap gap-2 items-center justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Build your room · Frontend composition</p>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>
            Build a space — no AR, just frontal
          </h1>
          <p className="text-sm text-stone-600 mt-1">Choose a room, add pieces, watch the scene update. 2D composition engine, entirely frontend.</p>
        </div>
        <Link href="/discover" className="text-sm underline hidden sm:block">← Back to discover</Link>
      </div>

      <div className="flex gap-2 overflow-auto scrollbar-none pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {(Object.keys(ROOM_PRODUCTS) as Room[]).map(r => (
          <button key={r} onClick={() => { setRoom(r); setPlaced([]); }} className={`shrink-0 h-10 px-5 rounded-full border text-sm font-medium ${room === r ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8]"}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mt-6">
        {/* scene */}
        <div className="relative bg-[#F5EEE6] rounded-[24px] overflow-hidden min-h-[420px] sm:min-h-[520px] p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{room}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E8E2D8]">{scene.length} pieces placed</span>
          </div>

          <div className="flex-1 relative mt-4 bg-white rounded-[16px] overflow-hidden border border-[#E8E2D8] flex items-center justify-center">
            {/* abstract room shape */}
            <div className="absolute inset-0" style={{ background: room === "Living room" ? "radial-gradient(ellipse at 50% 0%, #F5EEE6 0%, white 70%)" : room === "Bedroom" ? "linear-gradient(to bottom, #FFFBF5, #E8E2D8)" : "linear-gradient(to bottom, white, #F5EEE6)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#E8E2D8]/40" style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)" }} />

            {scene.length === 0 ? (
              <p className="relative text-sm text-stone-500 text-center p-6">Tap products on the right to place them in the scene.<br />Pure frontend — positions are deterministic, not random.</p>
            ) : (
              <div className="relative w-full h-full p-4 grid grid-cols-2 gap-3 content-center">
                {scene.map(p => (
                  <div key={p.id} className="bg-[#FFFBF5] rounded-xl border border-[#E8E2D8] p-2 flex gap-2 items-center animate-in fade-in">
                    <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-white" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{p.name}</p>
                      <p className="text-[11px] text-stone-500">R{p.price.toLocaleString("en-ZA")}</p>
                      <button onClick={() => toggle(p.slug)} className="text-[11px] underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setPlaced([])} className="h-9 px-4 rounded-full bg-white border border-[#E8E2D8] text-sm">Clear scene</button>
            <Link href="/shop?category=home" className="h-9 px-4 rounded-full bg-[#11110F] text-white text-sm inline-flex items-center">Shop {room}</Link>
          </div>
        </div>

        {/* picker */}
        <div>
          <h3 className="font-semibold mb-3">Add to scene</h3>
          <div className="grid grid-cols-2 gap-3">
            {pool.map(p => {
              const active = placed.includes(p.slug);
              return (
                <button key={p.id} onClick={() => toggle(p.slug)} className={`text-left rounded-[16px] overflow-hidden border bg-white group ${active ? "border-[#11110F] ring-1 ring-[#11110F]" : "border-[#E8E2D8] hover:border-[#11110F]"}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-[#F5EEE6]">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition" loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium leading-tight line-clamp-1">{p.name}</p>
                    <p className="text-xs text-stone-500">R{p.price.toLocaleString("en-ZA")} · {p.brand}</p>
                    <span className={`inline-flex mt-2 text-xs px-2.5 py-1 rounded-full ${active ? "bg-[#11110F] text-white" : "bg-[#F5EEE6] border border-[#E8E2D8]"}`}>{active ? "✓ Placed" : "+ Add"}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-400 mt-3">Deterministic 2D composition — no AR required. Prices in ZAR.</p>
        </div>
      </div>
    </div>
  );
}
