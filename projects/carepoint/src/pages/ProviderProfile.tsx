import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProviderBySlug, PROVIDERS, MEDICAL_AIDS } from "../data/providers";
import { getSpecialty } from "../data/specialties";
import { getCity } from "../data/locations";
import { getClinic } from "../data/clinics";
import { getFaqs, getReviews } from "../lib/services";
import { useApp, useAvailability } from "../store/store";
import { Monogram, NextAvailabilityPill, SaveButton, CompareToggle } from "../components/provider/ProviderCard";
import { MapPanel } from "../components/map/MapPanel";
import { Accordion, Badge, Breadcrumbs, Button, EmptyState, Rating, StatusPill } from "../components/ui";
import { Icon } from "../components/icons";
import type { IconName } from "../components/icons";
import { cx, dayLabel, googleDirectionsUrl, googleMapsUrl, track, usePageMeta, zar } from "../lib/utils";

export default function ProviderProfile() {
  const { slug } = useParams();
  const provider = getProviderBySlug(slug);
  const navigate = useNavigate();
  const { days } = useAvailability(provider?.id);

  usePageMeta(
    provider ? `${provider.name} — ${getSpecialty(provider.specialty)?.name} in ${provider.suburb} | CarePoint` : "Provider not found | CarePoint",
    provider ? `${provider.name}, ${getSpecialty(provider.specialty)?.name} at ${provider.practice}, ${provider.suburb}. Fees, availability and booking on CarePoint.` : undefined,
  );

  useEffect(() => {
    if (provider) track("provider_viewed", { providerId: provider.id });
  }, [provider]);

  if (!provider) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon="user"
          title="We couldn't find that provider"
          body="The profile may have moved or the link is out of date. Try searching the directory instead."
          action={<Button to="/search">Search providers</Button>}
        />
      </div>
    );
  }

  const spec = getSpecialty(provider.specialty);
  const city = getCity(provider.citySlug);
  const clinic = getClinic(provider.clinicId);
  const reviews = getReviews(provider);
  const faqs = getFaqs(provider);
  const nearby = PROVIDERS.filter((p) => p.citySlug === provider.citySlug && p.id !== provider.id).slice(0, 12);

  return (
    <div>
      {/* header band */}
      <div className="border-b border-line bg-cream">
        <div className="container-x py-7">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Specialties", to: "/specialties" },
              { label: spec?.name ?? "Specialty", to: `/specialties/${provider.specialty}` },
              { label: provider.name },
            ]}
          />
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Monogram id={provider.id} name={provider.name} size="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{provider.name}</h1>
                  {provider.featured && <Badge tone="pine">Long-standing profile</Badge>}
                </div>
                <p className="mt-1.5 text-[15.5px] font-medium text-ink-2">
                  {spec?.name} · {provider.practice}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-3">
                  <Icon name="mapPin" className="h-4 w-4" />
                  {provider.suburb}, {city?.name} · {provider.distanceKm.toFixed(1)} km · {provider.yearsExperience} years in practice
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Rating value={provider.rating} count={provider.reviewCount} />
                  <NextAvailabilityPill providerId={provider.id} />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <SaveButton providerId={provider.id} className="h-11 w-11" />
              <CompareToggle providerId={provider.id} className="h-11" />
              <Button variant="outline" size="lg" icon="mapPin" iconRight="external" href={googleMapsUrl(provider.lat, provider.lng, `${provider.practice}, ${provider.suburb}`)}>
                View location
              </Button>
              <Button size="lg" icon="calendar" onClick={() => { track("booking_started", { providerId: provider.id }); navigate(`/book/${provider.slug}`); }}>
                Book appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        {/* main column */}
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="about-h">
            <h2 id="about-h" className="font-display text-2xl font-semibold">About</h2>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">{provider.about}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {provider.languages.map((l) => (
                <Badge key={l}>
                  <Icon name="globe" className="h-3 w-3" /> {l}
                </Badge>
              ))}
            </div>
          </section>

          <section aria-labelledby="fees-h">
            <h2 id="fees-h" className="font-display text-2xl font-semibold">Services & fees</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line bg-cream px-5 py-3">
                <span className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Item</span>
                <span className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Fee</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-5 py-3.5">
                <span className="text-[14.5px] font-semibold">First consultation</span>
                <span className="text-[14.5px] font-bold tabular-nums">{zar(provider.feeConsultation)}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-5 py-3.5">
                <span className="text-[14.5px] font-semibold">Follow-up consultation</span>
                <span className="text-[14.5px] font-bold tabular-nums">{zar(provider.feeFollowUp)}</span>
              </div>
              {provider.services.map((s) => (
                <div key={s} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-5 py-3 last:border-b-0">
                  <span className="flex items-center gap-2 text-[14px] text-ink-2">
                    <Icon name="check" className="h-4 w-4 text-pine" strokeWidth={2.4} /> {s}
                  </span>
                  <span className="text-[12.5px] font-medium text-ink-3">Included in consultation</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
              Fees are sample concept figures. Additional procedures or tests may carry separate costs — the practice should confirm these before treatment.
            </p>
          </section>

          <section aria-labelledby="cred-h">
            <h2 id="cred-h" className="font-display text-2xl font-semibold">Credentials & experience</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <ul className="space-y-2.5 rounded-xl border border-line bg-card p-5">
                {provider.qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-2.5 text-[14.5px] text-ink-2">
                    <Icon name="shield" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-pine" />
                    {q}
                  </li>
                ))}
              </ul>
              <div className="flex flex-row gap-4 sm:flex-col">
                <div className="flex-1 rounded-xl border border-line bg-card p-5 text-center sm:text-left">
                  <p className="font-display text-3xl font-semibold text-pine">{provider.yearsExperience}</p>
                  <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">Years in practice</p>
                </div>
              </div>
            </div>
            {provider.areasOfPractice.length > 0 && (
              <div className="mt-4">
                <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Areas of practice</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {provider.areasOfPractice.map((a) => (
                    <Badge key={a} tone="pine">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-3 text-[12.5px] text-ink-3">Qualifications shown are fictional concept data for this product preview.</p>
          </section>

          <section aria-labelledby="avail-h">
            <h2 id="avail-h" className="font-display text-2xl font-semibold">Availability — next 7 days</h2>
            <div className="mt-4 rounded-xl border border-line bg-card p-5">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {days.slice(0, 7).map((d) => (
                  <div key={d.date} className={cx("flex w-[118px] shrink-0 flex-col rounded-lg border p-3", d.status === "unavailable" ? "border-line bg-paper" : "border-pine-4/50 bg-pine-3/40")}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-3">{d.label}</p>
                    <div className="mt-2 [&>span]:w-full [&>span]:justify-center">
                      <StatusPill status={d.status} />
                    </div>
                    <p className={cx("mt-2 text-[12.5px] font-bold tabular-nums", d.freeSlots.length > 0 ? "text-ink" : "text-ink-3")}>
                      {d.freeSlots.length > 0 ? `${d.freeSlots.length} slot${d.freeSlots.length === 1 ? "" : "s"}` : "No times"}
                    </p>
                    {d.freeSlots.length > 0 && <p className="text-[12px] font-semibold tabular-nums text-pine-2">From {d.freeSlots[0]}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-[13.5px] text-ink-2">Times shown are start times for {provider.consultationTypes.includes("video") ? "in-person and video" : "in-person"} consultations.</p>
                <Button size="sm" iconRight="arrowRight" onClick={() => navigate(`/book/${provider.slug}`)}>
                  Choose a time
                </Button>
              </div>
            </div>
          </section>

          <section id="profile-map" aria-labelledby="map-h" className="scroll-mt-24">
            <h2 id="map-h" className="font-display text-2xl font-semibold">Location & directions</h2>
            <p className="mt-2 text-[14.5px] text-ink-2">
              {provider.practice} — {provider.address}, {city?.name}. {clinic ? `Part of ${clinic.name} (${clinic.facilityType.toLowerCase()}).` : ""} Open: {clinic?.hours ?? "Contact the practice for hours."}
            </p>
            <MapPanel providers={[provider, ...nearby]} selectedId={provider.id} citySlug={provider.citySlug} className="mt-4 h-[380px]" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-md text-[12px] leading-relaxed text-ink-3">
                Interactive map with real map data (© OpenStreetMap, © CARTO). Provider addresses are fictional listings placed inside real {city?.name} areas.
              </p>
              <Button variant="outline" size="sm" icon="directions" iconRight="external" href={googleDirectionsUrl(provider.lat, provider.lng, `${provider.practice}, ${provider.suburb}`)}>
                Get directions
              </Button>
            </div>
          </section>

          <section aria-labelledby="rev-h">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="rev-h" className="font-display text-2xl font-semibold">Patient feedback</h2>
              <Rating value={provider.rating} count={provider.reviewCount} />
            </div>
            <p className="mt-1.5 text-[12.5px] text-ink-3">Sample reviews — illustrative content for this concept preview, not real patient feedback.</p>
            {reviews.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line-2 bg-cream px-5 py-6 text-[14px] text-ink-2">No reviews have been published for this profile yet.</p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <figure key={r.name + r.when} className="rounded-xl border border-line bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1" aria-label={`Rated ${r.rating} out of 5`}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Icon key={i} name="star" filled={i < r.rating} className={cx("h-3.5 w-3.5", i < r.rating ? "text-gold" : "text-line-2")} />
                        ))}
                      </span>
                      <span className="text-[12px] font-medium text-ink-3">{r.when}</span>
                    </div>
                    <blockquote className="mt-3 text-[14px] leading-relaxed text-ink-2">“{r.text}”</blockquote>
                    <figcaption className="mt-3 text-[12.5px] font-bold text-ink">{r.name}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="faq-h">
            <h2 id="faq-h" className="font-display text-2xl font-semibold">Common questions</h2>
            <div className="mt-4">
              <Accordion items={faqs} />
            </div>
          </section>
        </div>

        {/* sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="card overflow-hidden">
            <div className="border-b border-line bg-night px-5 py-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-cream/60">Book with {provider.name.split(" ").slice(-1)[0]}</p>
              <p className="mt-1 font-display text-xl font-semibold text-cream">{zar(provider.feeConsultation)}</p>
              <p className="text-[12.5px] text-cream/60">first consultation · follow-up {zar(provider.feeFollowUp).toLowerCase()}</p>
            </div>
            <div className="space-y-3.5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-ink-2">Next available</span>
                <NextAvailabilityPill providerId={provider.id} prefix="" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13.5px] font-semibold text-ink-2">Consultation types</span>
                <span className="flex gap-1.5">
                  {provider.consultationTypes.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">
                      <Icon name={(t === "video" ? "video" : t === "follow-up" ? "clock" : "home") as IconName} className="h-3 w-3" />
                      {t === "in-person" ? "In-person" : t === "video" ? "Video" : "Follow-up"}
                    </span>
                  ))}
                </span>
              </div>
              <div className="border-t border-line pt-3.5">
                <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Medical aid</p>
                {provider.aidStatus === "accepted" ? (
                  <>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-pine-2">
                      <Icon name="checkCircle" className="h-4 w-4" /> Accepted schemes
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {provider.aids.map((a) => (
                        <Badge key={a} tone="pine">{a}</Badge>
                      ))}
                      {MEDICAL_AIDS.filter((m) => !provider.aids.includes(m)).map((m) => (
                        <Badge key={m}>{m} — not listed</Badge>
                      ))}
                    </div>
                  </>
                ) : provider.aidStatus === "not-listed" ? (
                  <p className="mt-1.5 text-[13.5px] text-ink-2">Medical aid participation is not listed. You may be able to claim reimbursement — ask the practice.</p>
                ) : (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-gold">
                    <Icon name="wallet" className="h-4 w-4" /> Self-pay only
                  </p>
                )}
              </div>
              <Button className="w-full" size="lg" icon="calendar" onClick={() => { track("booking_started", { providerId: provider.id }); navigate(`/book/${provider.slug}`); }}>
                Book appointment
              </Button>
              <p className="text-center text-[12px] text-ink-3">No payment is taken — you confirm details at the practice.</p>
            </div>
          </div>

          {clinic && (
            <div className="card p-5">
              <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Practice</p>
              <Link to={`/clinics/${clinic.slug}`} className="mt-2 block font-display text-[17px] font-semibold text-pine-2 underline-offset-4 hover:underline">
                {clinic.name}
              </Link>
              <p className="mt-1 text-[13.5px] text-ink-2">{clinic.address}</p>
              <div className="mt-3 space-y-2 text-[13.5px] text-ink-2">
                <p className="flex items-center gap-2"><Icon name="clock" className="h-4 w-4 text-pine" /> {clinic.hours}</p>
                <p className="flex items-center gap-2"><Icon name="phone" className="h-4 w-4 text-pine" /> {clinic.phone}</p>
                <p className="flex items-center gap-2"><Icon name="building" className="h-4 w-4 text-pine" /> {clinic.facilityType}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* mobile sticky booking bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-[55] border-t border-line bg-cream/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold">{zar(provider.feeConsultation)}</p>
            <NextAvailabilityPillCompact providerId={provider.id} />
          </div>
          <Button icon="calendar" onClick={() => { track("booking_started", { providerId: provider.id }); navigate(`/book/${provider.slug}`); }}>
            Book appointment
          </Button>
        </div>
      </div>

      <JsonLd provider={provider} />
    </div>
  );
}

function NextAvailabilityPillCompact({ providerId }: { providerId: string }) {
  const { next } = useAvailability(providerId);
  return <p className="text-[11.5px] font-semibold text-pine-2">{next ? `Next: ${dayLabel(next.date)} · ${next.time}` : "No slots in 14 days"}</p>;
}

function JsonLd({ provider }: { provider: ReturnType<typeof getProviderBySlug> }) {
  const data = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: provider?.practice,
      description: provider?.about,
      address: { "@type": "PostalAddress", streetAddress: provider?.address, addressLocality: provider?.suburb },
      medicalSpecialty: provider?.specialty,
    }),
    [provider],
  );
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
