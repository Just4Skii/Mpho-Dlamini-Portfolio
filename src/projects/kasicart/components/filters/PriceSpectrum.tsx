import { useState, useRef } from "react";

export function PriceSpectrum({
  min = 0,
  max = 5000,
  value,
  onChange,
  count,
}: {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  count?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"min" | "max" | null>(null);

  const pctMin = ((value[0] - min) / (max - min)) * 100;
  const pctMax = ((value[1] - min) / (max - min)) * 100;

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drag || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clientX = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const val = Math.round((pct / 100) * (max - min) + min);
    if (drag === "min") onChange([Math.min(val, value[1] - 50), value[1]]);
    else onChange([value[0], Math.max(val, value[0] + 50)]);
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs tracking-widest uppercase text-stone-500">Price spectrum</p>
        {typeof count === "number" && (
          <span key={count} className="text-xs px-2 py-1 rounded-full bg-[#11110F] text-white tabular-nums animate-[pulse_0.3s_ease]">{count} products</span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2 tabular-nums">
        <span>R{min.toLocaleString("en-ZA")}</span>
        <span>R{Math.round(max / 2).toLocaleString("en-ZA")}</span>
        <span>R{max.toLocaleString("en-ZA")}</span>
      </div>

      <div
        ref={ref}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseUp={() => setDrag(null)}
        onTouchEnd={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
        className="relative h-10 flex items-center select-none touch-none"
      >
        {/* track */}
        <div className="absolute left-0 right-0 h-2 rounded-full bg-[#E8E2D8] overflow-hidden">
          <div className="absolute h-full bg-[#11110F] rounded-full" style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }} />
          {/* subtle spectrum */}
          <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(90deg, #F5EEE6 0%, #E8E2D8 30%, #C45D3C 75%, #11110F 100%)" }} />
        </div>

        {/* thumbs */}
        <button
          aria-label="Minimum price"
          onMouseDown={() => setDrag("min")}
          onTouchStart={() => setDrag("min")}
          className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#11110F] shadow-md flex items-center justify-center -translate-x-1/2 active:scale-110 transition"
          style={{ left: `${pctMin}%` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#11110F]" />
        </button>
        <button
          aria-label="Maximum price"
          onMouseDown={() => setDrag("max")}
          onTouchStart={() => setDrag("max")}
          className="absolute w-7 h-7 rounded-full bg-white border-2 border-[#11110F] shadow-md flex items-center justify-center -translate-x-1/2 active:scale-110 transition"
          style={{ left: `${pctMax}%` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#11110F]" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="flex-1 h-9 inline-flex items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-sm tabular-nums">R{value[0].toLocaleString("en-ZA")}</span>
        <span className="text-stone-400">—</span>
        <span className="flex-1 h-9 inline-flex items-center justify-center rounded-full bg-white border border-[#E8E2D8] text-sm tabular-nums">R{value[1].toLocaleString("en-ZA")}</span>
      </div>
      <p className="text-[11px] text-stone-400 mt-2 text-center">Drag to rearrange • Products morph as you slide</p>
    </div>
  );
}
