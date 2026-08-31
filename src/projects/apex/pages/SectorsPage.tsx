import Link from "@/projects/apex/compat/next";
import { sectors } from "@/projects/apex/lib/data";
import type { Metadata } from "@/projects/apex/compat/next";

export const metadata: Metadata = {
  title: "Sectors",
  description: "Facilities and property services adapted to the operational reality of different estates — from social housing to commercial portfolios.",
};

export default function SectorsPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SECTORS</div>
          <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">Built for the way different properties operate.</h1>
          <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-2xl">
            The same compliance, different operational constraints. We adapt delivery to access, occupancy, safeguarding and commercial realities — with reporting that satisfies procurement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((s) => (
          <Link key={s.slug} href={`/sectors/${s.slug}`} className="group bg-white border border-neutral-200 overflow-hidden hover:border-ink transition-colors flex flex-col">
            <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
              <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <h2 className="font-display text-[20px] font-semibold text-white">{s.name}</h2>
                <p className="text-xs font-mono text-white/70 mt-1">{s.services.slice(0, 3).join(" · ")}</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm leading-relaxed text-neutral-600 flex-1">{s.headline}</p>
              <div className="mt-4 text-sm font-medium inline-flex items-center gap-2">Explore sector <span className="group-hover:translate-x-1 transition-transform">→</span></div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-ink text-white p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[20px] font-semibold">Your sector not listed?</h3>
            <p className="text-sm text-white/60 mt-1">If you manage property, we likely support it. Tell us about your estate and constraints.</p>
          </div>
          <Link href="/contact" className="bg-amber text-ink px-6 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors shrink-0">Discuss Your Requirements →</Link>
        </div>
      </section>
    </div>
  );
}
