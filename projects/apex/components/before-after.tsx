"use client";
import { useState, useRef } from "react";

export default function BeforeAfter() {
  const [pos, setPos] = useState(52);
  const ref = useRef<HTMLDivElement>(null);

  const update = (clientX: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(8, Math.min(92, (x / rect.width) * 100));
    setPos(pct);
  };

  return (
    <div className="bg-white border border-neutral-200">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 lg:p-10">
          <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">REPRESENTATIVE SCENARIO · DAMP & MOULD REMEDIATION — ILLUSTRATIVE</div>
          <h3 className="font-display text-[26px] lg:text-[30px] font-semibold leading-tight">From persistent damp to a healthy internal environment.</h3>
          <p className="text-[15px] leading-relaxed text-neutral-600 mt-4">
            Drag to compare. The remediation included moisture mapping, removal of affected finishes, anti-fungal treatment, ventilation improvements and resident guidance.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-2">BEFORE</div>
              <ul className="space-y-1.5 text-neutral-600">
                <li>• Recurring mould on external wall</li>
                <li>• High relative humidity (78%)</li>
                <li>• Cold bridging at window reveals</li>
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-amber mb-2">AFTER</div>
              <ul className="space-y-1.5 text-ink">
                <li>• Treated & redecorated surfaces</li>
                <li>• Humidity stabilised (52%)</li>
                <li>• Ventilation upgraded + guidance</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs font-mono text-concrete">
            <span className="w-2 h-2 bg-amber rounded-full animate-pulse" />
            Illustrative scenario — 86-home programme — representative example
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-neutral-200 bg-stone p-6 lg:p-8">
          <div
            ref={ref}
            className="relative aspect-[4/3] overflow-hidden bg-neutral-200 select-none touch-none cursor-ew-resize"
            onMouseMove={(e) => e.buttons === 1 && update(e.clientX)}
            onTouchMove={(e) => update(e.touches[0].clientX)}
            onClick={(e) => update(e.clientX)}
          >
            {/* After image */}
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
              alt="After remediation — clean, bright interior"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            {/* Before image - clipped */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
              <img
                src="https://images.unsplash.com/photo-1560184611-6a68fd9edcb5?w=800&h=600&fit=crop&sat=-100"
                alt="Before remediation — damp affected interior"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${100 * (100 / pos)}%`, maxWidth: "none" }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-ink/20" />
            </div>
            {/* divider */}
            <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]" style={{ left: `${pos}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center border border-neutral-200"
              style={{ left: `${pos}%` }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 3L8 7L4 11" stroke="#0F0F0F" strokeWidth="1.2"/><path d="M10 3L6 7L10 11" stroke="#0F0F0F" strokeWidth="1.2" transform="scale(-1,1) translate(-14,0)"/></svg>
            </div>
            <div className="absolute top-3 left-3 bg-ink text-white text-[11px] font-mono tracking-wide px-2 py-1">BEFORE</div>
            <div className="absolute top-3 right-3 bg-amber text-ink text-[11px] font-mono tracking-wide px-2 py-1 font-medium">AFTER</div>
            <input
              type="range"
              min={8}
              max={92}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="absolute -bottom-1 left-0 right-0 opacity-0"
              aria-label="Before and after slider"
            />
          </div>
          <p className="text-xs text-concrete font-mono mt-3 text-center">Drag the divider or use the slider — works on touch and mouse</p>
        </div>
      </div>
    </div>
  );
}
