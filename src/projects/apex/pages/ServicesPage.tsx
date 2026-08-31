import Link from "@/projects/apex/compat/next";
import { services } from "@/projects/apex/lib/data";
import type { Metadata } from "@/projects/apex/compat/next";

export const metadata: Metadata = {
  title: "Services",
  description: "Integrated repairs, planned maintenance and specialist building services — from a single repair to a multi-site programme.",
};

const categories = ["Property Services", "Building Services", "Compliance & Safety", "Project Works"];

export default function ServicesPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SERVICES</div>
              <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">Services built around the property lifecycle.</h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-2xl">
                From urgent faults to planned programmes — one operational partner. We structure delivery around how property teams actually procure, schedule and report.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <div className="inline-block bg-stone border border-neutral-200 p-6 text-left">
                <div className="font-mono text-[11px] tracking-wide text-concrete">HOW IT WORKS</div>
                <ol className="mt-3 space-y-1.5 text-sm">
                  <li>→ Single point of contact</li>
                  <li>→ Right trade, right time</li>
                  <li>→ Auditable close-out</li>
                </ol>
                <Link href="/contact" className="inline-flex mt-4 bg-ink text-white px-5 py-2.5 text-sm font-medium">Discuss Your Requirements →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {categories.map((cat) => (
        <section key={cat} className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-ink">{cat.toUpperCase()}</h2>
            <span className="flex-1 h-px bg-neutral-200" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter((s) => s.category === cat).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group bg-white border border-neutral-200 overflow-hidden hover:border-ink transition-colors flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img src={s.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-semibold text-[18px] group-hover:text-amber transition-colors">{s.name}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600 mt-2 flex-1">{s.short}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">View service <span className="group-hover:translate-x-1 transition-transform">→</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-ink text-white p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[22px] font-semibold">Not sure which service fits?</h3>
            <p className="text-sm text-white/60 mt-2 max-w-xl">Tell us the property, the issue and the timescales — we’ll recommend the right route and next step.</p>
          </div>
          <Link href="/contact" className="bg-amber text-ink px-6 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors inline-flex items-center gap-2 shrink-0">
            Speak to our team →
          </Link>
        </div>
      </section>
    </div>
  );
}
