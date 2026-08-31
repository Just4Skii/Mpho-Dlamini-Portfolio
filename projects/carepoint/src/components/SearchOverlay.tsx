import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import { PROVIDERS } from "../data/providers";
import { SPECIALTIES, getSpecialty } from "../data/specialties";
import { CLINICS } from "../data/clinics";
import { CITIES } from "../data/locations";
import { quickSuggestions, searchAll } from "../lib/search";
import { useApp } from "../store/store";
import { track } from "../lib/utils";
import { cx } from "../lib/utils";

interface FlatItem {
  key: string;
  icon: IconName;
  label: string;
  sub: string;
  group: string;
  to: string;
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { recent, addRecent } = useApp();

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const groups = useMemo(() => searchAll(q, PROVIDERS, SPECIALTIES, CLINICS, CITIES, getSpecialty), [q]);
  const suggestions = useMemo(() => quickSuggestions(q, SPECIALTIES), [q]);

  const flat = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    suggestions.forEach((s, i) => items.push({ key: `sug-${i}`, icon: "spark", label: s.label, sub: s.hint, group: "Suggestions", to: s.to }));
    groups.providers.forEach(({ provider }) =>
      items.push({
        key: provider.id,
        icon: "user",
        label: provider.name,
        sub: `${getSpecialty(provider.specialty)?.name ?? provider.specialty} · ${provider.suburb}`,
        group: "Providers",
        to: `/providers/${provider.slug}`,
      }),
    );
    groups.specialties.forEach((s) => items.push({ key: `spec-${s.slug}`, icon: s.icon as IconName, label: s.name, sub: "Specialty", group: "Specialties", to: `/specialties/${s.slug}` }));
    groups.clinics.forEach((c) => items.push({ key: c.id, icon: "building", label: c.name, sub: `${c.area} · ${c.facilityType}`, group: "Clinics", to: `/clinics/${c.slug}` }));
    groups.locations.forEach((l) => items.push({ key: l.slug, icon: "mapPin", label: l.name, sub: `${l.province} · ${l.areas.length} areas`, group: "Locations", to: `/locations/${l.slug}` }));
    return items;
  }, [groups, suggestions]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const go = (to: string, term?: string) => {
    if (term) addRecent(term);
    track("search_completed", { q, to });
    onClose();
    navigate(to);
  };

  const submit = () => {
    track("search_started", { q });
    go(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`, q);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[active];
      if (item) go(item.to, q);
      else submit();
    }
  };

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[92] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search CarePoint">
      <div className="anim-fade absolute inset-0 bg-night/55" onClick={onClose} />
      <div className="anim-fade-up relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-card shadow-lift">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Icon name="search" className="h-5 w-5 text-ink-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="What are you looking for? Try “physio”, “GP Sandton”, “dentist Durban”…"
            aria-label="Search providers, specialties, clinics and locations"
            className="h-14 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3/70"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="rounded-lg p-2 text-ink-3 hover:bg-paper hover:text-ink">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto">
          {!q && (
            <div className="px-5 py-4">
              <p className="kicker mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {["GP", "Dentist", "Physiotherapist", "Psychologist", "Dermatologist", "Optometrist", "Paediatrician"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => go(`/search?q=${encodeURIComponent(t)}`, t)}
                    className="rounded-full border border-line-2 bg-cream px-3.5 py-1.5 text-[13.5px] font-medium text-ink-2 transition-colors hover:border-pine hover:text-pine-2"
                  >
                    {t}
                  </button>
                ))}
              </div>
              {recent.length > 0 && (
                <>
                  <p className="kicker mb-3 mt-6">Recent searches</p>
                  <ul className="space-y-1">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => go(`/search?q=${encodeURIComponent(r)}`, r)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14.5px] text-ink-2 hover:bg-paper hover:text-ink"
                        >
                          <Icon name="clock" className="h-4 w-4 text-ink-3" />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {q && flat.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="font-display text-lg font-semibold">No matches for “{q}”</p>
              <p className="mt-1.5 text-[14px] text-ink-2">Try a broader term like “GP”, or search a city such as “Durban”.</p>
              <button type="button" onClick={submit} className="mt-4 text-[14px] font-bold text-pine underline-offset-4 hover:underline">
                See all results for “{q}”
              </button>
            </div>
          )}

          {q && flat.length > 0 && (
            <ul ref={listRef} role="listbox" aria-label="Search suggestions" className="py-2">
              {flat.map((item, idx) => {
                const showHeader = item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <li key={item.key}>
                    {showHeader && <p className="kicker px-5 pb-1 pt-3">{item.group}</p>}
                    <button
                      type="button"
                      data-idx={idx}
                      role="option"
                      aria-selected={idx === active}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(item.to, q)}
                      className={cx("flex w-full items-center gap-3.5 px-5 py-2.5 text-left", idx === active ? "bg-pine-3/70" : "hover:bg-paper")}
                    >
                      <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", idx === active ? "bg-pine text-cream" : "bg-paper text-pine")}>
                        <Icon name={item.icon} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold text-ink">{item.label}</span>
                        <span className="block truncate text-[12.5px] text-ink-3">{item.sub}</span>
                      </span>
                      {idx === active && <Icon name="arrowRight" className="h-4 w-4 text-pine" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-cream px-5 py-3">
          <p className="hidden text-[12px] text-ink-3 sm:block">
            <kbd className="rounded border border-line bg-card px-1.5 py-0.5 font-sans text-[10.5px] font-semibold">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded border border-line bg-card px-1.5 py-0.5 font-sans text-[10.5px] font-semibold">↵</kbd> open ·{" "}
            <kbd className="rounded border border-line bg-card px-1.5 py-0.5 font-sans text-[10.5px] font-semibold">esc</kbd> close
          </p>
          <button type="button" onClick={submit} className="text-[13.5px] font-bold text-pine underline-offset-4 hover:underline">
            See all results →
          </button>
        </div>
      </div>
    </div>
  );
}
