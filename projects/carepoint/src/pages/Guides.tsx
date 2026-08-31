import { Link, useParams } from "react-router-dom";
import { GUIDES, getGuide } from "../data/guides";
import { IMAGES } from "../data/images";
import { Breadcrumbs, Button, EmptyState, Reveal } from "../components/ui";
import { Icon } from "../components/icons";
import { track, usePageMeta } from "../lib/utils";

export function GuidesList() {
  usePageMeta("Healthcare guides | CarePoint", "Practical, general guides to getting the most from South African healthcare — preparation, questions to ask and finding care near you.");
  const [featured, ...rest] = GUIDES;
  return (
    <div className="container-x py-8">
      <p className="kicker">Guides</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Small reads that make visits better</h1>
      <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">
        General, practical guidance — never diagnosis. Written to help you prepare, ask better questions and navigate care with confidence.
      </p>

      <Reveal>
        <Link to={`/guides/${featured.slug}`} className="card group mt-9 grid overflow-hidden lg:grid-cols-[1fr_1.1fr]" onClick={() => track("guide_opened", { slug: featured.slug })}>
          <div className="overflow-hidden">
            <img src={IMAGES[featured.image as keyof typeof IMAGES]} alt="" className="h-full min-h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.15em] text-pine">{featured.tag} · {featured.minutes} min read</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight group-hover:text-pine-2">{featured.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{featured.intro}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-pine">
              Read the guide <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
        {rest.map((g, i) => (
          <Reveal key={g.slug} delay={i * 60} className="bg-card">
            <Link to={`/guides/${g.slug}`} className="group flex h-full gap-5 p-6 transition-colors hover:bg-pine-3/25" onClick={() => track("guide_opened", { slug: g.slug })}>
              <img src={IMAGES[g.image as keyof typeof IMAGES]} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-pine">{g.tag} · {g.minutes} min</p>
                <h3 className="mt-1.5 font-display text-[18px] font-semibold leading-snug group-hover:text-pine-2">{g.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{g.intro}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <p className="mt-8 rounded-lg border border-line bg-cream px-4 py-3 text-[12.5px] text-ink-3">
        Guides are general information only and are not medical advice. If you're worried about a symptom, book a consultation — a GP is the right place to start.
      </p>
    </div>
  );
}

export function GuideDetail() {
  const { slug } = useParams();
  const guide = getGuide(slug);
  usePageMeta(guide ? `${guide.title} | CarePoint Guides` : "Guide | CarePoint", guide?.intro);

  if (!guide) {
    return (
      <div className="container-x py-16">
        <EmptyState icon="info" title="Guide not found" body="That article isn't available." action={<Button to="/guides">All guides</Button>} />
      </div>
    );
  }

  const idx = GUIDES.findIndex((g) => g.slug === guide.slug);
  const nextGuide = GUIDES[(idx + 1) % GUIDES.length];

  return (
    <div>
      <div className="border-b border-line bg-cream">
        <div className="container-x max-w-3xl py-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Guides", to: "/guides" }, { label: guide.title }]} />
          <p className="mt-6 text-[11.5px] font-bold uppercase tracking-[0.15em] text-pine">{guide.tag} · {guide.minutes} min read</p>
          <h1 className="mt-2.5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{guide.title}</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-2">{guide.intro}</p>
        </div>
      </div>

      <article className="container-x max-w-3xl py-10">
        <img src={IMAGES[guide.image as keyof typeof IMAGES]} alt="" className="aspect-[2/1] w-full rounded-xl border border-line object-cover" loading="lazy" />
        <div className="mt-9 space-y-9">
          {guide.sections.map((s) => (
            <Reveal key={s.heading}>
              <section>
                <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">{s.body}</p>
                {s.list && (
                  <ul className="mt-4 space-y-2.5 rounded-xl border border-line bg-card p-5">
                    {s.list.map((li) => (
                      <li key={li} className="flex items-start gap-2.5 text-[14.5px] text-ink-2">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2.4} /> {li}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-line bg-night p-7 text-cream sm:p-8">
          <p className="font-display text-xl font-semibold">Put it into practice</p>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-cream/65">The best preparation is a good provider. Search the directory, compare a few options and book a time that suits you.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button to="/search" icon="search">Find a provider</Button>
            <Button to={`/guides/${nextGuide.slug}`} variant="ghost" className="text-cream hover:bg-night-2" iconRight="arrowRight" onClick={() => track("guide_opened", { slug: nextGuide.slug })}>
              Next: {nextGuide.title}
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
