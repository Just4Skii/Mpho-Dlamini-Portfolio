import { Link, useNavigate } from "react-router-dom";
import type { Provider } from "../../types";
import { getSpecialty } from "../../data/specialties";
import { getCity } from "../../data/locations";
import { useApp, useAvailability } from "../../store/store";
import { cx, dayLabel, initials, monogramTone, track, zar } from "../../lib/utils";
import { Icon } from "../icons";
import { Rating } from "../ui";

export function Monogram({ id, name, size = "md" }: { id: string; name: string; size?: "sm" | "md" | "lg" }) {
  const tone = monogramTone(id);
  const cls = size === "lg" ? "h-24 w-24 text-2xl" : size === "sm" ? "h-10 w-10 text-[13px]" : "h-14 w-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={cx("flex shrink-0 select-none items-center justify-center rounded-full font-display font-semibold", cls)}
      style={{ background: tone.bg, color: tone.fg }}
    >
      {initials(name)}
    </span>
  );
}

export function NextAvailabilityPill({ providerId, prefix = "Next available" }: { providerId: string; prefix?: string }) {
  const { next } = useAvailability(providerId);
  if (!next) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 text-[12px] font-semibold text-ink-3">
        <Icon name="slash" className="h-3.5 w-3.5" /> No slots in the next 14 days
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-pine-4/60 bg-pine-3 px-2 py-1 text-[12px] font-semibold text-pine-2">
      <span className="anim-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-pine" aria-hidden="true" />
      {prefix}: {dayLabel(next.date)} · {next.time}
    </span>
  );
}

export function SaveButton({ providerId, className }: { providerId: string; className?: string }) {
  const { saved, toggleSaved, toast } = useApp();
  const isSaved = saved.includes(providerId);
  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved providers" : "Save provider"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(providerId);
        track("provider_saved", { providerId, saved: !isSaved });
        toast(isSaved ? "info" : "success", isSaved ? "Removed from saved providers" : "Provider saved to your list");
      }}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
        isSaved ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine hover:text-pine",
        className,
      )}
    >
      <Icon name="heart" filled={isSaved} className={cx("h-[17px] w-[17px]", !isSaved && "anim-none")} strokeWidth={2} />
    </button>
  );
}

export function CompareToggle({ providerId, className }: { providerId: string; className?: string }) {
  const { compare, toggleCompare, toast } = useApp();
  const inCompare = compare.includes(providerId);
  const full = compare.length >= 4 && !inCompare;
  return (
    <button
      type="button"
      aria-pressed={inCompare}
      aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (full) {
          toast("info", "You can compare up to 4 providers at once");
          return;
        }
        toggleCompare(providerId);
      }}
      className={cx(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors",
        inCompare ? "border-night bg-night text-cream" : "border-line-2 bg-card text-ink-2 hover:border-night hover:text-ink",
        className,
      )}
    >
      <Icon name="columns" className="h-3.5 w-3.5" />
      {inCompare ? "Added" : "Compare"}
    </button>
  );
}

export function ProviderCard({ provider, highlight = false }: { provider: Provider; highlight?: boolean }) {
  const spec = getSpecialty(provider.specialty);
  const city = getCity(provider.citySlug);
  const navigate = useNavigate();

  return (
    <article
      className={cx(
        "card group relative p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-pine/50",
        highlight && "border-pine ring-2 ring-pine/20",
      )}
      style={{ boxShadow: highlight ? "var(--shadow-lift)" : undefined }}
    >
      <Link to={`/providers/${provider.slug}`} className="absolute inset-0 z-[1] rounded-xl" aria-label={`View profile: ${provider.name}`} onClick={() => track("provider_viewed", { providerId: provider.id })} />

      <div className="flex items-start gap-4">
        <Monogram id={provider.id} name={provider.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-[17px] font-semibold leading-tight text-ink group-hover:text-pine-2">
                {provider.name}
              </h3>
              <p className="mt-0.5 truncate text-[13.5px] font-medium text-ink-2">
                {spec?.name} · <span className="text-ink-3">{provider.practice}</span>
              </p>
            </div>
            <div className="relative z-[2] flex shrink-0 gap-1.5">
              <SaveButton providerId={provider.id} />
            </div>
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-3">
            <Icon name="mapPin" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {provider.suburb}, {city?.name} · {provider.distanceKm.toFixed(1)} km away
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {provider.consultationTypes.includes("in-person") && (
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">
            <Icon name="home" className="h-3 w-3" /> In-person
          </span>
        )}
        {provider.consultationTypes.includes("video") && (
          <span className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">
            <Icon name="video" className="h-3 w-3" /> Video
          </span>
        )}
        <span
          className={cx(
            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11.5px] font-semibold",
            provider.aidStatus === "accepted" && "border-pine-4/60 bg-pine-3 text-pine-2",
            provider.aidStatus === "not-listed" && "border-line bg-paper text-ink-3",
            provider.aidStatus === "self-pay" && "border-gold/25 bg-gold-bg text-gold",
          )}
        >
          <Icon name="shield" className="h-3 w-3" />
          {provider.aidStatus === "accepted" ? `Medical aid · ${provider.aids.slice(0, 2).join(", ")}${provider.aids.length > 2 ? " +" : ""}` : provider.aidStatus === "not-listed" ? "Aid not listed" : "Self-pay only"}
        </span>
        <span className="inline-flex items-center rounded-md border border-line bg-paper px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">
          {zar(provider.feeConsultation)}
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-line pt-3.5">
        <div className="flex flex-col gap-1.5">
          <NextAvailabilityPill providerId={provider.id} />
          <Rating value={provider.rating} count={provider.reviewCount} />
        </div>
        <div className="relative z-[2] flex items-center gap-1.5">
          <CompareToggle providerId={provider.id} />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              track("booking_started", { providerId: provider.id });
              navigate(`/book/${provider.slug}`);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-pine px-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-pine-2"
          >
            Book
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
