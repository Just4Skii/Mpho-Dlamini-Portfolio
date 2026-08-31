import { projects } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.title, description: p.desc };
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-8">
          <Link href="/projects" className="text-sm font-medium inline-flex items-center gap-2 hover:text-amber transition-colors">← Back to projects</Link>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono bg-ink text-white px-3 py-1">{project.sector}</span>
            <span className="text-xs font-mono bg-stone border border-neutral-200 px-3 py-1">{project.service}</span>
            <span className="text-xs font-mono bg-amber text-ink px-3 py-1 font-medium">ILLUSTRATIVE SCENARIO — PORTFOLIO DEMONSTRATION</span>
          </div>
          <h1 className="font-display text-[32px] lg:text-[42px] font-semibold leading-[0.9] tracking-tight mt-4 max-w-3xl">{project.title}</h1>
          <p className="text-[16px] leading-relaxed text-neutral-600 mt-4 max-w-2xl">{project.desc}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-8">
        <div className="aspect-[16/9] overflow-hidden bg-neutral-100 border border-neutral-200">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 p-5 text-center">
                <div className="font-display text-[24px] font-semibold">{project.metrics.properties}</div>
                <div className="font-mono text-[11px] tracking-wide text-concrete">PROPERTIES</div>
              </div>
              <div className="bg-white border border-neutral-200 p-5 text-center">
                <div className="font-display text-[24px] font-semibold">{project.metrics.weeks} weeks</div>
                <div className="font-mono text-[11px] tracking-wide text-concrete">PROGRAMME</div>
              </div>
              <div className="bg-amber p-5 text-center border border-amber">
                <div className="font-display text-[24px] font-semibold">{project.metrics.completion}</div>
                <div className="font-mono text-[11px] tracking-wide text-ink/70">COMPLETION</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200">
              <div className="p-8">
                <h2 className="font-display text-[20px] font-semibold">Scenario</h2>
                <p className="text-[15px] leading-relaxed text-neutral-600 mt-3">{project.challenge}</p>
              </div>
              <div className="p-8 border-t border-neutral-200">
                <h2 className="font-display text-[20px] font-semibold">Illustrative approach</h2>
                <p className="text-[15px] leading-relaxed text-neutral-600 mt-3">{project.approach}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-amber">—</span> Dedicated account management and single point of contact</li>
                  <li className="flex gap-2"><span className="text-amber">—</span> Phased programme with clear access windows and communications</li>
                  <li className="flex gap-2"><span className="text-amber">—</span> Qualified trades with auditable close-out per job</li>
                </ul>
              </div>
              <div className="p-8 border-t border-neutral-200 bg-stone">
                <h2 className="font-display text-[20px] font-semibold">Services delivered</h2>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.service.split(", ").map((s) => (
                    <span key={s} className="text-xs font-mono bg-white border border-neutral-200 px-3 py-1.5">{s}</span>
                  ))}
                  <span className="text-xs font-mono bg-white border border-neutral-200 px-3 py-1.5">Multi-Trade Works</span>
                  <span className="text-xs font-mono bg-white border border-neutral-200 px-3 py-1.5">Compliance Support</span>
                </div>
              </div>
              <div className="p-8 border-t border-neutral-200">
                <h2 className="font-display text-[20px] font-semibold">Illustrative outcome</h2>
                <p className="text-[15px] leading-relaxed text-neutral-600 mt-3">{project.outcome}</p>
                <p className="text-xs font-mono text-concrete mt-4">Illustrative scenario data — representative example, not a real client claim.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-ink text-white p-8">
              <h3 className="font-display font-semibold text-[18px]">Have a similar requirement?</h3>
              <p className="text-sm text-white/60 leading-relaxed mt-2">We’ll outline scope, trades, timescales and reporting — within one working day.</p>
              <Link href="/contact" className="inline-flex mt-6 bg-amber text-ink px-5 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors">Discuss Your Requirements →</Link>
              <div className="mt-6 pt-6 border-t border-white/10 text-xs font-mono text-white/40">
                Or call demonstration: +27 (0)11 234 5678
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="font-mono text-[11px] tracking-wide text-concrete">PROJECT META</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-600">Sector</span><span className="font-medium">{project.sector}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Service</span><span className="font-medium">{project.service}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">Works</span><span className="font-medium">{project.metrics.works}</span></div>
              </div>
            </div>

            <div className="bg-amber-light border border-amber/20 p-6">
              <div className="font-mono text-[11px] tracking-wide text-ink/60">NEXT</div>
              <div className="text-sm font-medium mt-2">Explore all projects</div>
              <Link href="/projects" className="inline-flex mt-3 border border-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-white transition-colors">View portfolio →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
