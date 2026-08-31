import { useParams } from "react-router-dom";
import { sectors, services, projects } from "@/projects/apex/lib/data";
import Link from "@/projects/apex/compat/next";
import { notFound } from "@/projects/apex/compat/next";
import type { Metadata } from "@/projects/apex/compat/next";

export function generateStaticParams() {
  return sectors.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = sectors.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: s.name, description: s.headline };
}

export default function SectorDetail() {
  const { slug } = useParams<{ slug: string }>();
  const sector = sectors.find((s) => s.slug === slug);
  if (!sector) notFound();

  // find relevant project
  const relatedProject = projects.find((p) => p.sector.toLowerCase().includes(sector.name.toLowerCase().split(" ")[0])) || projects[0];

  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">SECTORS — {sector.name.toUpperCase()}</div>
              <h1 className="font-display text-[34px] lg:text-[44px] font-semibold leading-[0.9] tracking-tight mt-3">{sector.headline}</h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-5">{sector.desc}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {sector.services.map((sv) => (
                  <span key={sv} className="text-xs font-mono bg-stone border border-neutral-200 px-3 py-1.5">{sv}</span>
                ))}
              </div>
              <Link href="/contact" className="inline-flex mt-8 bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-ink-2 transition-colors">Discuss {sector.name} Requirements →</Link>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-100 border border-neutral-200">
                <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display text-[22px] font-semibold">Challenges we see in {sector.name.toLowerCase()}.</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {sector.challenges.map((c) => (
                <div key={c} className="bg-white border border-neutral-200 p-5">
                  <div className="w-2 h-2 bg-amber rounded-full mb-3" />
                  <div className="text-sm font-medium">{c}</div>
                  <div className="text-xs text-neutral-600 leading-relaxed mt-1">Operational reality — not marketing copy. We plan around it.</div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white border border-neutral-200 p-8">
              <h3 className="font-display text-[18px] font-semibold">How we work in this sector.</h3>
              <ol className="mt-4 space-y-3">
                {[
                  `Understand — ${sector.considerations.toLowerCase()} and access constraints mapped.`,
                  "Plan — programme built around occupancy, safeguarding or commercial windows.",
                  "Deliver — vetted engineers, clear comms and site control.",
                  "Report — auditable documentation ready for compliance or recharge.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center text-xs font-mono shrink-0">{i + 1}</span>
                    <span className="leading-relaxed text-neutral-700">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-ink text-white p-8">
              <div className="font-mono text-[11px] tracking-[0.18em] text-white/50">RELEVANT SERVICES</div>
              <ul className="mt-4 space-y-3">
                {sector.services.map((sv) => {
                  const found = services.find((x) => x.name === sv);
                  return (
                    <li key={sv}>
                      <Link href={found ? `/services/${found.slug}` : "/services"} className="flex items-center justify-between py-2 border-b border-white/10 hover:text-amber transition-colors">
                        <span className="text-sm font-medium">{sv}</span>
                        <span>→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/services" className="inline-flex mt-6 text-sm font-medium border border-white/20 px-4 py-2 hover:bg-white hover:text-ink transition-colors">View all services</Link>
            </div>

            <div className="bg-white border border-neutral-200 overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <img src={relatedProject.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="font-mono text-[11px] tracking-wide text-concrete">REPRESENTATIVE SCENARIO — ILLUSTRATIVE</div>
                <h3 className="font-display font-semibold mt-1">{relatedProject.title}</h3>
                <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{relatedProject.desc}</p>
                <Link href={`/projects/${relatedProject.slug}`} className="inline-flex mt-4 bg-ink text-white px-5 py-2.5 text-sm font-medium">View Scenario →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-amber p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-[20px] font-semibold">Speak to our team about {sector.name.toLowerCase()}.</h3>
            <p className="text-sm text-ink/70 mt-1">We’ll outline scope, timescales and next steps within one working day.</p>
          </div>
          <Link href="/contact" className="bg-ink text-white px-6 py-3 text-sm font-semibold hover:bg-ink-2 transition-colors shrink-0">Discuss Your Requirements →</Link>
        </div>
      </section>
    </div>
  );
}
