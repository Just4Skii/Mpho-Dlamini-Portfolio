import { useEffect, useState } from "react";
import { products } from "@/projects/kasicart/data/products";
import { Product } from "@/projects/kasicart/types";

type Tile = { id: string; slug: string; x: number; y: number; w: number; h: number };

const SEED = ["umhlanga-stoneware-mug", "handwoven-reversible-throw", "durban-coast-coffee-house-roast", "everyday-canvas-tote", "oak-desk-organiser", "earth-pigment-print-a2"];

export default function MoodboardPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [drag, setDrag] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kasicart_moodboard");
      if (raw) { setTiles(JSON.parse(raw)); return; }
    } catch {}
    // init
    setTiles(
      SEED.slice(0, 4).map((slug, i) => ({
        id: `t-${i}`,
        slug,
        x: 20 + (i % 2) * 180,
        y: 20 + Math.floor(i / 2) * 180,
        w: 160,
        h: 160,
      }))
    );
  }, []);
  useEffect(() => {
    try { localStorage.setItem("kasicart_moodboard", JSON.stringify(tiles)); } catch {}
  }, [tiles]);

  const addRandom = () => {
    const pool = products.filter(p => !tiles.some(t => t.slug === p.slug));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    setTiles(t => [...t, { id: `t-${Date.now()}`, slug: pick.slug, x: 40 + Math.random() * 200, y: 40 + Math.random() * 200, w: 160, h: 160 }]);
  };

  const onDown = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    const tile = tiles.find(t => t.id === id);
    if (!tile) return;
    const clientX = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setDrag(id);
    setOffset({ x: clientX - tile.x, y: clientY - tile.y });
  };
  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drag) return;
    const clientX = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setTiles(ts => ts.map(t => (t.id === drag ? { ...t, x: clientX - offset.x, y: clientY - offset.y } : t)));
  };
  const onUp = () => setDrag(null);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Moodboard · Collections</p>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>
            Drag, resize, curate — your space
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-[60ch]">Movable visual tiles. Recruiter-grade demo: drag product photographs around a canvas. Persists locally. No backend.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRandom} className="h-10 px-5 rounded-full bg-[#11110F] text-white text-sm font-medium">+ Add product</button>
          <button onClick={() => setTiles([])} className="h-10 px-5 rounded-full bg-white border border-[#E8E2D8] text-sm">Clear</button>
        </div>
      </div>

      <div
        onMouseMove={onMove}
        onMouseUp={onUp}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        className="relative mt-6 bg-[#FFFBF5] border-2 border-dashed border-[#E8E2D8] rounded-[24px] overflow-hidden min-h-[520px] sm:min-h-[600px] select-none touch-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #E8E2D8 1px, transparent 0)", backgroundSize: "20px 20px" }}
      >
        {tiles.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-sm text-stone-500">Your board is empty — add products to start curating.</p>}
        {tiles.map(t => {
          const p = products.find(x => x.slug === t.slug);
          if (!p) return null;
          return (
            <div
              key={t.id}
              onMouseDown={e => onDown(e, t.id)}
              onTouchStart={e => onDown(e, t.id)}
              className={`absolute bg-white rounded-[16px] overflow-hidden border shadow-sm flex flex-col cursor-grab active:cursor-grabbing touch-none ${drag === t.id ? "shadow-xl z-20 scale-[1.02]" : "hover:shadow-md"}`}
              style={{ left: t.x, top: t.y, width: t.w, height: t.h }}
            >
              <div className="flex-1 overflow-hidden bg-[#F5EEE6] relative">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" draggable={false} loading="lazy" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&h=400&fit=crop"; }} />
                <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-white/90 backdrop-blur border border-white text-[#11110F]">Drag</span>
                <button
                  onClick={e => { e.stopPropagation(); setTiles(ts => ts.filter(x => x.id !== t.id)); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#11110F] text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-stone-500">R{p.price.toLocaleString("en-ZA")}</p>
              </div>
              {/* resize handle */}
              <div
                onMouseDown={e => {
                  e.stopPropagation();
                  const startW = t.w;
                  const startX = (e as React.MouseEvent).clientX;
                  const onMoveResize = (ev: MouseEvent) => {
                    const dw = ev.clientX - startX;
                    setTiles(ts => ts.map(x => (x.id === t.id ? { ...x, w: Math.max(120, Math.min(260, startW + dw)), h: Math.max(120, Math.min(260, startW + dw)) } : x)));
                  };
                  const onUpResize = () => { window.removeEventListener("mousemove", onMoveResize); window.removeEventListener("mouseup", onUpResize); };
                  window.addEventListener("mousemove", onMoveResize);
                  window.addEventListener("mouseup", onUpResize);
                }}
                className="absolute bottom-1 right-1 w-6 h-6 rounded bg-white border border-[#E8E2D8] flex items-center justify-center cursor-nwse-resize text-[10px]"
              >
                ⤡
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">Drag to reorder</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">Pinch-resize on mobile via handle</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">Persists in localStorage</span>
      </div>
    </div>
  );
}
