import { useEffect } from "react";
import type { DayAvailability } from "../../types";
import { useAvailability } from "../../store/store";
import { cx } from "../../lib/utils";
import { Icon } from "../icons";
import { StatusPill } from "../ui";

export function AvailabilityCalendar({
  providerId,
  date,
  time,
  onPickDate,
  onPickTime,
  compact = false,
  daysCount = 14,
}: {
  providerId: string;
  date: string | null;
  time: string | null;
  onPickDate: (d: string) => void;
  onPickTime?: (t: string) => void;
  compact?: boolean;
  daysCount?: number;
}) {
  const { days } = useAvailability(providerId);
  const view = days.slice(0, daysCount);

  // keep the selected day valid: jump to first available day when needed
  useEffect(() => {
    if (view.length === 0) return;
    const current = view.find((d) => d.date === date);
    if (!current || current.freeSlots.length === 0) {
      const firstFree = view.find((d) => d.freeSlots.length > 0);
      if (firstFree && firstFree.date !== date) onPickDate(firstFree.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, date]);

  const selectedDay: DayAvailability | undefined = view.find((d) => d.date === date) ?? view.find((d) => d.freeSlots.length > 0);

  return (
    <div>
      {/* date strip */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="listbox" aria-label="Choose a date">
        {view.map((d) => {
          const sel = d.date === selectedDay?.date;
          const disabled = d.freeSlots.length === 0;
          return (
            <button
              key={d.date}
              type="button"
              role="option"
              aria-selected={sel}
              disabled={disabled}
              onClick={() => onPickDate(d.date)}
              className={cx(
                "flex w-[64px] shrink-0 flex-col items-center rounded-lg border px-1 py-2 transition-all",
                sel ? "border-pine bg-pine text-cream shadow-sm" : disabled ? "border-line bg-paper text-ink-3/60" : "border-line-2 bg-card text-ink hover:border-pine hover:text-pine-2",
              )}
            >
              <span className={cx("text-[10.5px] font-bold uppercase tracking-wide", sel ? "text-cream/70" : "text-ink-3")}>{d.weekday}</span>
              <span className="font-display text-[19px] font-semibold leading-tight">{d.dayNum}</span>
              <span className={cx("text-[10px] font-semibold uppercase", sel ? "text-cream/70" : "text-ink-3")}>{d.monthShort}</span>
              <span className="mt-1" aria-hidden="true">
                {d.status === "available" && <Icon name="check" className={cx("h-3.5 w-3.5", sel ? "text-cream" : "text-pine")} strokeWidth={2.6} />}
                {d.status === "limited" && <Icon name="clock" className={cx("h-3.5 w-3.5", sel ? "text-cream" : "text-gold")} />}
                {d.status === "unavailable" && <Icon name="minus" className={cx("h-3.5 w-3.5", sel ? "text-cream/60" : "text-line-2")} />}
              </span>
              <span className="sr-only">{d.label} — {d.status === "available" ? "available" : d.status === "limited" ? "limited availability" : "fully booked"}</span>
            </button>
          );
        })}
      </div>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium text-ink-3">
        <span className="flex items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 text-pine" strokeWidth={2.6} /> Available</span>
        <span className="flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5 text-gold" /> Limited</span>
        <span className="flex items-center gap-1.5"><Icon name="minus" className="h-3.5 w-3.5 text-line-2" /> Fully booked</span>
        {selectedDay && <span className="ml-auto hidden sm:block"><StatusPill status={selectedDay.status} /></span>}
      </div>

      {/* time slots */}
      <div className="mt-3.5">
        {selectedDay && selectedDay.slots.length > 0 ? (
          <>
            <p className="mb-2.5 text-[13px] font-semibold text-ink-2">
              Choose a time — <span className="text-ink">{selectedDay.label}</span>
            </p>
            <div className={cx("grid gap-2", compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-5 md:grid-cols-6")}>
              {selectedDay.slots.map((t) => {
                const isFree = selectedDay.freeSlots.includes(t);
                const sel = time === t && date === selectedDay.date;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isFree}
                    aria-pressed={sel}
                    aria-label={`${t} on ${selectedDay.label}${isFree ? ", available" : ", unavailable"}`}
                    onClick={() => onPickTime?.(t)}
                    className={cx(
                      "flex h-11 items-center justify-center gap-1.5 rounded-lg border text-[14px] font-bold tabular-nums transition-all",
                      sel && "border-pine bg-pine text-cream shadow-sm",
                      !sel && isFree && "border-line-2 bg-card text-ink hover:border-pine hover:bg-pine-3/40 hover:text-pine-2 active:translate-y-px",
                      !isFree && "border-line bg-paper text-ink-3/50 line-through decoration-line-2",
                    )}
                  >
                    {!isFree && <Icon name="slash" className="h-3.5 w-3.5" />}
                    {t}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line-2 bg-cream px-4 py-8 text-center">
            <p className="text-[14.5px] font-semibold text-ink-2">No appointments available on this date.</p>
            <p className="mt-1 text-[13px] text-ink-3">Try the next day with availability in the strip above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
