import { useState } from "react";
import Link from "@/projects/kasicart/compat/next";

const NODES = [
  { id: "home", label: "HOME", angle: 0, radius: 92, href: "/category/home" },
  { id: "fashion", label: "FASHION", angle: 60, radius: 96, href: "/category/fashion" },
  { id: "beauty", label: "BEAUTY", angle: 120, radius: 94, href: "/category/beauty" },
  { id: "food", label: "FOOD", angle: 180, radius: 92, href: "/category/food" },
  { id: "design", label: "DESIGN", angle: 240, radius: 96, href: "/category/design" },
  { id: "tech", label: "TECH", angle: 300, radius: 94, href: "/category/tech" },
];

export function ProductUniverse({ onSelect }: { onSelect?: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const [center, setCenter] = useState(false);
  return (
    <div className="relative bg-[#11110F] rounded-[24px] overflow-hidden p-6 sm:p-8 md:p-10 min-h-[420px] sm:min-h-[480px] flex flex-col">
      <div className="flex flex-wrap gap-2 justify-between items-start mb-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-white/60">Product universe</p>
          <h3 className="text-[22px] sm:text-[26px] font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-instrument)" }}>
            Categories orbit around you
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-[40ch]">Move between worlds — products transition spatially. No reload, just motion.</p>
        </div>
        <span className="hidden sm:inline text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/70">Drag or hover • Tap to explore</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center select-none touch-manipulation">
        {/* center */}
        <button
          onClick={() => setCenter(v => !v)}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[86px] h-[86px] sm:w-[96px] sm:h-[96px] rounded-full flex flex-col items-center justify-center border transition z-10 ${center ? "bg-white text-[#11110F] border-white" : "bg-[#FFFBF5] text-[#11110F] border-white/20 shadow-xl hover:scale-[1.02]"}`}
        >
          <span className="text-[11px] tracking-widest uppercase text-stone-500">You</span>
          <span className="text-sm font-semibold -mt-0.5">{center ? "Explore" : "YOU"}</span>
          <span className="text-[10px] text-stone-500 hidden sm:block">← drag →</span>
        </button>

        {/* orbit rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-white/5" />

        {/* nodes */}
        <div className="absolute left-1/2 top-1/2 w-0 h-0">
          {NODES.map(n => {
            const rad = (n.angle * Math.PI) / 180;
            const x = Math.cos(rad) * n.radius * (hover === n.id ? 1.06 : 1);
            const y = Math.sin(rad) * n.radius * (hover === n.id ? 1.06 : 1);
            const isHover = hover === n.id;
            return (
              <Link
                key={n.id}
                href={n.href}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(n.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x * 2.2, top: y * 1.15 }}
              >
                <span
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-full border text-xs sm:text-sm font-medium whitespace-nowrap transition
                  ${isHover ? "bg-white text-[#11110F] border-white shadow-lg scale-[1.04]" : "bg-white/95 text-[#11110F] border-white/60 hover:bg-white"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${n.id === "home" ? "bg-[#C45D3C]" : n.id === "fashion" ? "bg-[#11110F]" : n.id === "beauty" ? "bg-[#9CAF88]" : n.id === "food" ? "bg-[#E6A57E]" : n.id === "design" ? "bg-[#6B7A5B]" : "bg-[#1E3A2E]"}`} />
                  {n.label}
                </span>
                {/* dot */}
                <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80 group-hover:bg-white transition ${isHover ? "opacity-0" : "opacity-60"}`} style={{ transform: `translate(-50%, -50%) translate(${-x * 0.15}px, ${-y * 0.15}px)` }} />
              </Link>
            );
          })}
        </div>

        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] tracking-wide text-white/40 whitespace-nowrap">Spatial exploration • No AI — curated</p>
      </div>
    </div>
  );
}
