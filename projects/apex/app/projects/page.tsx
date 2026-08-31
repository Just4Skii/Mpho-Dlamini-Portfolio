import Link from "next/link";
import { projects } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Illustrative Scenarios",
  description: "Representative project scenarios — planned maintenance, HVAC, damp & mould and electrical compliance for South African portfolios. Illustrative scenarios, not real client work.",
};

export default function ProjectsPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">PROJECTS — REPRESENTATIVE SCENARIOS — ILLUSTRATIVE</div>
          <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">How the website communicates complex programmes.</h1>
          <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-2xl">
            Representative project scenarios for a South African context — Gauteng, Western Cape, KwaZulu-Natal and Eastern Cape. Scenario, approach and illustrative outcome. Metrics are labelled as illustrative scenario data — credibility over inflation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* featured large */}
          <Link href={`/projects/${projects[0].slug}`} className="lg:col-span-12 group grid lg:grid-cols-12 gap-0 bg-white border border-neutral-200 overflow-hidden hover:border-ink transition-colors">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-neutral-100 relative">
              <img src={projects[0].image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-ink text-white text-[11px] font-mono tracking-wide px-3 py-1">REPRESENTATIVE SCENARIO · ILLUSTRATIVE</div>
            </div>
            <div className="lg:col-span-5 p-8 flex flex-col">
              <div className="font-mono text-[11px] tracking-wide text-concrete">{projects[0].sector} — {projects[0].service}</div>
              <h2 className="font-display text-[24px] font-semibold leading-tight mt-2 group-hover:text-amber transition-colors">{projects[0].title}</h2>
              <p className="text-sm leading-relaxed text-neutral-600 mt-3 flex-1">{projects[0].desc}</p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-stone border border-neutral-200 p-3 text-center">
                  <div className="font-display font-semibold">125</div><div className="font-mono text-[10px] text-concrete">PROPERTIES</div>
                </div>
                <div className="bg-stone border border-neutral-200 p-3 text-center">
                  <div className="font-display font-semibold">1,400+</div><div className="font-mono text-[10px] text-concrete">WORKS</div>
                </div>
                <div className="bg-amber p-3 text-center">
                  <div className="font-display font-semibold">97%</div><div className="font-mono text-[10px] text-ink/70">FIRST-TIME</div>
                </div>
              </div>
              <div className="mt-6 text-sm font-medium">View Case Study →</div>
            </div>
          </Link>

          {projects.slice(1).map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="group bg-white border border-neutral-200 overflow-hidden hover:border-ink transition-colors flex flex-col">
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                <div className="absolute top-3 left-3 bg-white px-2.5 py-1 text-[11px] font-mono tracking-wide border border-neutral-200">{p.sector}</div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="font-mono text-[11px] tracking-wide text-concrete">{p.service}</div>
                <h3 className="font-display font-semibold text-[18px] leading-tight mt-1 group-hover:text-amber transition-colors">{p.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600 mt-2 flex-1 line-clamp-3">{p.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-concrete">
                  <span className="w-2 h-2 bg-amber rounded-full" />
                  {p.metrics.weeks} weeks · {p.metrics.works} · ILLUSTRATIVE
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
          <div className="bg-white border border-neutral-200 p-6 text-xs font-mono text-concrete leading-relaxed">
          Independent concept project — all scenarios are illustrative and hypothetical. Metrics are representative scenario data. No real client names or logos are used.
        </div>
      </section>
    </div>
  );
}
