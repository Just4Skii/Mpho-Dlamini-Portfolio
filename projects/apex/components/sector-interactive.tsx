"use client";
import { useState } from "react";
import { sectors } from "@/lib/data";
import Link from "next/link";

export default function SectorInteractive() {
  const [active, setActive] = useState(sectors[0].slug);
  const current = sectors.find((s) => s.slug === active)!;

  return (
    <div className="border border-neutral-200 bg-white overflow-hidden">
      <div className="grid lg:grid-cols-12">
        {/* nav */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-neutral-200">
          <div className="p-6 lg:p-8 pb-4">
            <div className="font-mono text-[11px] tracking-[0.18em] text-concrete">SELECT A SECTOR</div>
          </div>
          <nav className="px-2 pb-2 space-y-1" aria-label="Sectors">
            {sectors.map((s) => (
              <button
                key={s.slug}
                onClick={() => setActive(s.slug)}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between border transition-all ${
                  active === s.slug ? "bg-ink text-white border-ink" : "bg-white border-transparent hover:border-neutral-200 hover:bg-stone text-ink"
                }`}
              >
                <span className="text-sm font-medium">{s.name}</span>
                <span className={`text-xs transition-transform ${active === s.slug ? "translate-x-0" : ""}`}>→</span>
              </button>
            ))}
          </nav>
          <div className="p-6 hidden lg:block">
            <Link href={`/sectors/${current.slug}`} className="inline-flex items-center gap-2 text-sm font-medium border-b border-ink pb-1 hover:border-amber hover:text-amber transition-colors">
              Explore {current.name} →
            </Link>
          </div>
        </div>

        {/* content */}
        <div className="lg:col-span-8">
          <div className="aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-neutral-100 relative">
            <img src={current.image} alt={current.name} className="w-full h-full object-cover transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 text-[11px] font-mono tracking-wide">
                <span className="w-2 h-2 bg-amber rounded-full" />
                SECTOR SPOTLIGHT — {current.name.toUpperCase()}
              </div>
              <h3 className="font-display text-[22px] lg:text-[26px] font-semibold text-white leading-tight mt-3 max-w-xl">{current.headline}</h3>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <p className="text-[15px] leading-relaxed text-neutral-600">{current.desc}</p>
            <div className="grid sm:grid-cols-2 gap-8 mt-6 pt-6 border-t border-neutral-200">
              <div>
                <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">TYPICAL SERVICES</div>
                <ul className="space-y-2">
                  {current.services.map((sv) => (
                    <li key={sv} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-amber rounded-full" />
                      {sv}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-mono text-[11px] tracking-[0.18em] text-concrete mb-3">OPERATIONAL CONSIDERATIONS</div>
                <p className="text-sm leading-relaxed text-ink">{current.considerations}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {current.challenges.slice(0, 3).map((c) => (
                    <span key={c} className="text-xs font-mono bg-stone border border-neutral-200 px-2.5 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link href={`/sectors/${current.slug}`} className="lg:hidden inline-flex mt-6 bg-ink text-white px-5 py-3 text-sm font-medium">
              View {current.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
