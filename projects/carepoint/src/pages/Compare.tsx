import { Link } from "react-router-dom";
import { useApp, useAvailability } from "../store/store";
import { getProviderById } from "../data/providers";
import { getSpecialty } from "../data/specialties";
import { getCity } from "../data/locations";
import { Monogram } from "../components/provider/ProviderCard";
import { Button, EmptyState, Rating } from "../components/ui";
import { Icon } from "../components/icons";
import { dayLabel, usePageMeta, zar } from "../lib/utils";

function NextCell({ providerId }: { providerId: string }) {
  const { next } = useAvailability(providerId);
  return (
    <span className="font-semibold text-pine-2">{next ? `${dayLabel(next.date)} · ${next.time}` : <span className="font-medium text-ink-3">None in 14 days</span>}</span>
  );
}

export default function ComparePage() {
  usePageMeta("Compare providers | CarePoint");
  const { compare, toggleCompare, clearCompare } = useApp();
  const providers = compare.map((id) => getProviderById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (providers.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon="columns"
          title="Nothing to compare yet"
          body="Add providers with the “Compare” button on any provider card, then see fees, availability, languages and services side by side."
          action={<Button to="/search" icon="search">Browse providers</Button>}
        />
      </div>
    );
  }

  const rows: Array<{ label: string; render: (p: (typeof providers)[number]) => React.ReactNode }> = [
    { label: "Specialty", render: (p) => getSpecialty(p.specialty)?.name },
    { label: "Practice", render: (p) => p.practice },
    { label: "Location", render: (p) => `${p.suburb}, ${getCity(p.citySlug)?.name}` },
    { label: "Distance", render: (p) => `${p.distanceKm.toFixed(1)} km` },
    { label: "Next available", render: (p) => <NextCell providerId={p.id} /> },
    { label: "Consultation fee", render: (p) => <span className="font-bold tabular-nums">{zar(p.feeConsultation)}</span> },
    { label: "Follow-up fee", render: (p) => <span className="tabular-nums">{zar(p.feeFollowUp)}</span> },
    {
      label: "Consultation types",
      render: (p) => (
        <span className="flex flex-wrap gap-1">
          {p.consultationTypes.includes("in-person") && <span className="rounded-md bg-paper px-2 py-0.5 text-[11.5px] font-bold text-ink-2">In-person</span>}
          {p.consultationTypes.includes("video") && <span className="rounded-md bg-paper px-2 py-0.5 text-[11.5px] font-bold text-ink-2">Video</span>}
          {p.consultationTypes.includes("follow-up") && <span className="rounded-md bg-paper px-2 py-0.5 text-[11.5px] font-bold text-ink-2">Follow-up</span>}
        </span>
      ),
    },
    {
      label: "Medical aid",
      render: (p) =>
        p.aidStatus === "accepted" ? (
          <span className="flex flex-wrap gap-1">{p.aids.map((a) => <span key={a} className="rounded-md bg-pine-3 px-2 py-0.5 text-[11.5px] font-bold text-pine-2">{a}</span>)}</span>
        ) : p.aidStatus === "not-listed" ? (
          <span className="text-ink-3">Not listed</span>
        ) : (
          <span className="font-semibold text-gold">Self-pay only</span>
        ),
    },
    { label: "Languages", render: (p) => p.languages.join(", ") },
    { label: "Experience", render: (p) => `${p.yearsExperience} years` },
    { label: "Rating", render: (p) => <Rating value={p.rating} count={p.reviewCount} compact /> },
    { label: "Key services", render: (p) => <ul className="space-y-1">{p.services.slice(0, 3).map((s) => <li key={s} className="flex items-start gap-1.5 text-[13px]"><Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine" strokeWidth={2.4} />{s}</li>)}</ul> },
  ];

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Compare</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Side by side, calmly</h1>
          <p className="mt-2 text-[14px] text-ink-2">{providers.length} of 4 comparison slots used. Distances are indicative sample figures.</p>
        </div>
        <Button variant="outline" icon="trash" onClick={clearCompare}>Clear comparison</Button>
      </div>

      <div className="mt-7 overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-cream">
              <th className="sticky left-0 z-10 w-44 bg-cream px-5 py-4 text-[12px] font-bold uppercase tracking-wide text-ink-3">Provider</th>
              {providers.map((p) => (
                <th key={p.id} className="min-w-[220px] px-5 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <Monogram id={p.id} name={p.name} size="sm" />
                    <div className="min-w-0">
                      <Link to={`/providers/${p.slug}`} className="block truncate font-display text-[16px] font-semibold leading-tight hover:text-pine-2">
                        {p.name}
                      </Link>
                      <span className="block truncate text-[12px] font-medium text-ink-3">{getSpecialty(p.specialty)?.name}</span>
                    </div>
                    <button type="button" onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.name} from comparison`} className="ml-auto rounded p-1 text-ink-3 hover:bg-paper hover:text-danger">
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
              {providers.length < 4 && (
                <th className="min-w-[200px] px-5 py-4 align-middle">
                  <Link to="/search" className="flex h-full min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-2 text-[13px] font-bold text-ink-3 transition-colors hover:border-pine hover:text-pine-2">
                    <Icon name="plus" className="h-5 w-5" /> Add provider
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.label} className={ri % 2 === 0 ? "bg-card" : "bg-cream/50"}>
                <th scope="row" className="sticky left-0 z-10 bg-inherit px-5 py-3.5 text-[13px] font-bold text-ink-2" style={{ backgroundColor: ri % 2 === 0 ? "var(--color-card)" : "#faf8f2" }}>
                  {row.label}
                </th>
                {providers.map((p) => (
                  <td key={p.id} className="px-5 py-3.5 text-[14px] text-ink">
                    {row.render(p)}
                  </td>
                ))}
                {providers.length < 4 && <td className="px-5 py-3.5" />}
              </tr>
            ))}
            <tr className="border-t border-line bg-card">
              <th scope="row" className="sticky left-0 z-10 bg-card px-5 py-4 text-[13px] font-bold text-ink-2">Actions</th>
              {providers.map((p) => (
                <td key={p.id} className="px-5 py-4">
                  <div className="flex gap-2">
                    <Button size="sm" to={`/book/${p.slug}`}>Book</Button>
                    <Button size="sm" variant="outline" to={`/providers/${p.slug}`}>Profile</Button>
                  </div>
                </td>
              ))}
              {providers.length < 4 && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-[12.5px] text-ink-3">
        Ratings are sample concept data. “Next available” reflects the local availability model and updates as bookings are made on this device.
      </p>
    </div>
  );
}
