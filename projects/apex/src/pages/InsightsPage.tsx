import Link from "@/projects/apex/compat/next";
import { insights } from "@/projects/apex/lib/data";
import type { Metadata } from "@/projects/apex/compat/next";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical guidance for property managers, facilities teams and procurement — from planned maintenance to damp & mould strategy.",
};

export default function InsightsPage() {
  return (
    <div className="bg-stone">
      <section className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-[88rem] px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="font-mono text-[11px] tracking-[0.2em] text-concrete">INSIGHTS</div>
              <h1 className="font-display text-[36px] lg:text-[48px] font-semibold leading-[0.9] tracking-tight mt-3">Practical guidance — not thought-leadership theatre.</h1>
              <p className="text-[16px] leading-relaxed text-neutral-600 mt-6 max-w-2xl">
                Short, useful reads for property teams — how to procure maintenance, reduce reactive load and move from damp response to prevention.
              </p>
            </div>
            <div className="lg:col-span-5 lg:text-right">
              <div className="inline-block text-left bg-stone border border-neutral-200 p-6">
                <div className="font-mono text-[11px] tracking-wide text-concrete">EDITORIAL STANDARD</div>
                <p className="text-sm text-neutral-600 mt-2 max-w-sm leading-relaxed">Every article is written as a real facilities team would write it — clear, operational, without hype. Concept content for portfolio demonstration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {insights.map((article) => (
            <article key={article.slug} className="group bg-white border border-neutral-200 overflow-hidden hover:border-ink transition-colors flex flex-col">
              <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs font-mono text-concrete">
                  <span className="bg-stone border border-neutral-200 px-2 py-1">{article.category.toUpperCase()}</span>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.read}</span>
                </div>
                <h2 className="font-display text-[20px] font-semibold leading-tight mt-3 group-hover:text-amber transition-colors">{article.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-600 mt-2 flex-1">{article.excerpt}</p>
                <div className="mt-4 text-sm font-medium">Read article →</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-6 lg:px-8 pb-16">
        <div className="bg-ink text-white p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <p className="text-sm text-white/60 max-w-xl">Insights are concept editorial. In production, this would be powered by a CMS with categories, search and related services.</p>
          <Link href="/contact" className="bg-amber text-ink px-6 py-3 text-sm font-semibold hover:bg-amber-hover transition-colors shrink-0">Discuss Your Requirements →</Link>
        </div>
      </section>
    </div>
  );
}
