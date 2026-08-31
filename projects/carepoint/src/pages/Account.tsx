import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Appointment } from "../types";
import { useApp, useAvailability } from "../store/store";
import { getProviderById } from "../data/providers";
import { getSpecialty } from "../data/specialties";
import { getCity } from "../data/locations";
import { makeICS } from "../lib/services";
import { AvailabilityCalendar } from "../components/calendar/AvailabilityCalendar";
import { Monogram, ProviderCard } from "../components/provider/ProviderCard";
import { Badge, Button, Dialog, EmptyState, StatusPill } from "../components/ui";
import { Icon } from "../components/icons";
import { cx, dayLabel, downloadFile, fmtFull, fmtMed, googleDirectionsUrl, todayISO, track, usePageMeta, zar } from "../lib/utils";

export function displayStatus(a: Appointment): Appointment["status"] {
  if (a.status === "upcoming" && a.date < todayISO()) return "completed";
  return a.status;
}

/* ================= DASHBOARD ================= */

export function AccountHome() {
  usePageMeta("Your CarePoint | Account");
  const { appointments, saved, profile, toast } = useApp();
  const upcoming = appointments.filter((a) => displayStatus(a) === "upcoming");
  const next = upcoming.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];
  const nextProvider = next ? getProviderById(next.providerId) : undefined;

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Your CarePoint</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile ? `Hello, ${profile.firstName}` : "Welcome back"}
          </h1>
          <p className="mt-2 text-[14px] text-ink-2">
            You're browsing as a guest — appointments and saved providers are stored on this device.
          </p>
        </div>
        <Button to="/search" icon="search">Find care</Button>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* next appointment */}
        <div className="card overflow-hidden">
          <div className="border-b border-line bg-night px-6 py-4 text-cream">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-cream/55">Next appointment</p>
            {next && nextProvider ? (
              <p className="mt-1 font-display text-xl font-semibold">
                {dayLabel(next.date)} · {next.time} — {nextProvider.name}
              </p>
            ) : (
              <p className="mt-1 font-display text-xl font-semibold text-cream/70">Nothing scheduled yet</p>
            )}
          </div>
          <div className="p-6">
            {next && nextProvider ? (
              <div className="flex flex-wrap items-center gap-4">
                <Monogram id={nextProvider.id} name={nextProvider.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold">{getSpecialty(nextProvider.specialty)?.name} · {next.reason}</p>
                  <p className="text-[13px] text-ink-2">{next.type === "video" ? "Video consultation" : `${nextProvider.suburb}, ${getCity(nextProvider.citySlug)?.name}`} · {zar(next.fee)}</p>
                </div>
                <Button to={`/account/appointments/${next.id}`} variant="outline" size="sm" iconRight="arrowRight">
                  Manage
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <p className="text-[14.5px] leading-relaxed text-ink-2">When you book an appointment it will appear here with its date, time and everything you need on the day.</p>
                <Button to="/search?avail=today" icon="calendar">See today's availability</Button>
              </div>
            )}
          </div>
        </div>

        {/* stat tiles */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Upcoming", value: upcoming.length, icon: "calendar" as const, to: "/account/appointments" },
            { label: "Past & cancelled", value: appointments.length - upcoming.length, icon: "clock" as const, to: "/account/appointments" },
            { label: "Saved providers", value: saved.length, icon: "heart" as const, to: "/account/saved" },
            { label: "Cities covered", value: 6, icon: "mapPin" as const, to: "/locations" },
          ].map((s) => (
            <Link key={s.label} to={s.to} className="card group flex flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:border-pine/50">
              <Icon name={s.icon} className="h-5 w-5 text-pine" />
              <div className="mt-6">
                <p className="font-display text-3xl font-semibold">{s.value}</p>
                <p className="text-[12.5px] font-semibold text-ink-3">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* saved preview + guides */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section aria-labelledby="saved-h">
          <div className="flex items-center justify-between">
            <h2 id="saved-h" className="font-display text-xl font-semibold">Saved providers</h2>
            <Link to="/account/saved" className="text-[13px] font-bold text-pine hover:underline">View all</Link>
          </div>
          {saved.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line-2 bg-cream px-5 py-6 text-[14px] text-ink-2">
              No saved providers yet. Tap the <Icon name="heart" className="inline h-4 w-4 text-pine" /> on any provider to keep them here.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {saved.slice(0, 3).map((id) => {
                const p = getProviderById(id);
                if (!p) return null;
                return (
                  <li key={id}>
                    <Link to={`/providers/${p.slug}`} className="card flex items-center gap-3.5 p-4 transition-colors hover:border-pine/60">
                      <Monogram id={p.id} name={p.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-bold">{p.name}</span>
                        <span className="block truncate text-[12.5px] text-ink-3">{getSpecialty(p.specialty)?.name} · {p.suburb}, {getCity(p.citySlug)?.name}</span>
                      </span>
                      <Icon name="chevronRight" className="h-4.5 w-4.5 text-ink-3" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section aria-labelledby="pref-h">
          <h2 id="pref-h" className="font-display text-xl font-semibold">Preferences & privacy</h2>
          <div className="card mt-3 space-y-4 p-5">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Saved patient details</p>
              {profile ? (
                <p className="mt-1.5 text-[14px] text-ink-2">
                  {profile.firstName} {profile.lastName} · {profile.email} · {profile.phone}
                  {profile.language && ` · prefers ${profile.language}`}
                </p>
              ) : (
                <p className="mt-1.5 text-[13.5px] text-ink-3">Details you enter at booking can be remembered on this device.</p>
              )}
            </div>
            <div className="border-t border-line pt-4">
              <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Privacy</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
                CarePoint collects only what a booking needs — no ID numbers, diagnoses or medical records. Everything in this preview stays in your browser.
              </p>
            </div>
            <Button variant="outline" size="sm" icon="trash" onClick={() => { localStorage.clear(); toast("info", "Local data cleared — refreshing…"); window.setTimeout(() => window.location.reload(), 600); }}>
              Clear local data
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= APPOINTMENTS LIST ================= */

export function AppointmentsList() {
  usePageMeta("Your appointments | CarePoint");
  const { appointments } = useApp();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = appointments
    .filter((a) => (tab === "upcoming" ? displayStatus(a) === "upcoming" : displayStatus(a) !== "upcoming"))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return (
    <div className="container-x py-8">
      <p className="kicker">Your CarePoint</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Appointments</h1>

      <div className="mt-6 flex gap-1 rounded-lg border border-line-2 bg-paper p-1 sm:w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cx("flex-1 rounded-md px-5 py-2 text-[13.5px] font-bold transition-colors sm:flex-none", tab === t ? "bg-card text-pine-2 shadow-sm" : "text-ink-2 hover:text-ink")}
          >
            {t === "upcoming" ? "Upcoming" : "Past & cancelled"}
          </button>
        ))}
      </div>

      <div className="mt-6 max-w-3xl space-y-3.5">
        {list.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
            body={tab === "upcoming" ? "When you book care it will show up here, ready to manage or reschedule." : "Completed and cancelled appointments will be kept here for your records."}
            action={tab === "upcoming" ? <Button to="/search" icon="search">Find a provider</Button> : undefined}
          />
        ) : (
          list.map((a) => {
            const p = getProviderById(a.providerId);
            if (!p) return null;
            const status = displayStatus(a);
            return (
              <Link key={a.id} to={`/account/appointments/${a.id}`} className="card group flex items-center gap-4 p-5 transition-all hover:border-pine/50">
                <div className={cx("flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border", status === "upcoming" ? "border-pine-4/60 bg-pine-3 text-pine-2" : "border-line bg-paper text-ink-3")}>
                  <span className="text-[11px] font-bold uppercase">{dayLabel(a.date).split(" ")[0]}</span>
                  <span className="font-display text-xl font-semibold leading-none">{a.date.slice(8, 10)}</span>
                  <span className="text-[10.5px] font-bold uppercase">{fmtMed(a.date).split(" ")[2]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[15.5px] font-bold">
                    {a.time} — {p.name}
                    <StatusPill status={status} />
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-ink-2">
                    {getSpecialty(p.specialty)?.name} · {a.reason} · {a.type === "video" ? "Video" : p.suburb}
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-ink-3">{a.id}</p>
                </div>
                <Icon name="chevronRight" className="h-5 w-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-pine" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ================= APPOINTMENT DETAIL ================= */

export function AppointmentDetail() {
  const { id } = useParams();
  const { appointments, cancelAppointment, rescheduleAppointment, toast } = useApp();
  const appt = appointments.find((a) => a.id === id);
  const provider = appt ? getProviderById(appt.providerId) : undefined;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reschedOpen, setReschedOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);

  usePageMeta(appt ? `Appointment ${appt.id} | CarePoint` : "Appointment | CarePoint");

  const { next } = useAvailability(provider?.id);

  if (!appt || !provider) {
    return (
      <div className="container-x py-16">
        <EmptyState icon="calendar" title="Appointment not found" body="It may have been removed from this device. Your other appointments are safe." action={<Button to="/account/appointments">Back to appointments</Button>} />
      </div>
    );
  }

  const status = displayStatus(appt);
  const spec = getSpecialty(provider.specialty);
  const city = getCity(provider.citySlug);

  return (
    <div className="container-x py-8">
      <Link to="/account/appointments" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-2 hover:text-pine">
        <Icon name="arrowLeft" className="h-4 w-4" /> All appointments
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Appointment {appt.id}</h1>
            <StatusPill status={status} />
          </div>

          <div className="card mt-5 overflow-hidden">
            <Link to={`/providers/${provider.slug}`} className="flex items-center gap-4 border-b border-line bg-cream p-5 transition-colors hover:bg-pine-3/30">
              <Monogram id={provider.id} name={provider.name} />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold">{provider.name}</p>
                <p className="text-[13px] text-ink-2">{spec?.name} · {provider.practice}</p>
              </div>
              <span className="hidden text-[12.5px] font-bold text-pine sm:inline">View profile</span>
            </Link>
            <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
              {[
                ["Date", fmtFull(appt.date)],
                ["Time", appt.time],
                ["Type", appt.type === "video" ? "Video consultation" : appt.type === "follow-up" ? "Follow-up visit" : "In-person consultation"],
                ["Reason", appt.reason],
                ["Location", appt.type === "video" ? "Video — link to follow from the practice" : `${provider.address}, ${city?.name}`],
                ["Fee", zar(appt.fee)],
                ["Patient", `${appt.patient.firstName} ${appt.patient.lastName}`],
                ["Booked", fmtMed(appt.createdAt.slice(0, 10))],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-3">{k}</dt>
                  <dd className="mt-0.5 text-[14.5px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {status === "upcoming" && (
            <div className="mt-5 flex flex-wrap gap-3">
              <Button icon="calendar" variant="secondary" onClick={() => { setNewDate(null); setNewTime(null); setReschedOpen(true); }}>
                Reschedule
              </Button>
              <Button icon="download" variant="outline" onClick={() => { downloadFile(`carepoint-${appt.id}.ics`, makeICS(appt, provider), "text/calendar"); toast("info", "Calendar file downloaded."); }}>
                Add to calendar
              </Button>
              {appt.type !== "video" && (
                <Button icon="directions" iconRight="external" variant="outline" href={googleDirectionsUrl(provider.lat, provider.lng, `${provider.practice}, ${provider.suburb}`)}>
                  Get directions
                </Button>
              )}
              <Button icon="trash" variant="danger" onClick={() => setCancelOpen(true)}>
                Cancel appointment
              </Button>
            </div>
          )}
          {status === "cancelled" && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-cream px-5 py-4">
              <Icon name="info" className="h-5 w-5 text-ink-3" />
              <p className="flex-1 text-[14px] text-ink-2">This appointment was cancelled. The slot has been released.</p>
              <Button size="sm" to={`/book/${provider.slug}`}>Book again</Button>
            </div>
          )}
          {status === "completed" && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-cream px-5 py-4">
              <Icon name="checkCircle" className="h-5 w-5 text-pine" />
              <p className="flex-1 text-[14px] text-ink-2">This appointment has passed. Need to go back? Book a follow-up in one tap.</p>
              <Button size="sm" to={`/book/${provider.slug}`}>Book follow-up</Button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Need help on the day?</p>
            <ul className="mt-3 space-y-2.5 text-[13.5px] text-ink-2">
              <li className="flex gap-2"><Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-pine" /> Arrive 10 minutes early for first visits.</li>
              <li className="flex gap-2"><Icon name="wallet" className="mt-0.5 h-4 w-4 shrink-0 text-pine" /> Bring your medical aid card if you have one.</li>
              <li className="flex gap-2"><Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-pine" /> Running late? The practice's number is on the profile.</li>
            </ul>
            <Button to="/guides/what-to-bring" variant="ghost" size="sm" className="mt-4" iconRight="arrowRight">
              What to bring guide
            </Button>
          </div>
          <div className="card p-5">
            <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">{provider.name.split(" ").slice(-1)[0]}'s next open slot</p>
            <p className="mt-2 font-display text-lg font-semibold text-pine-2">{next ? `${dayLabel(next.date)} · ${next.time}` : "None in the next 14 days"}</p>
          </div>
        </aside>
      </div>

      {/* cancel dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this appointment?">
        <p className="text-[14.5px] leading-relaxed text-ink-2">
          You're about to cancel <strong>{appt.id}</strong> with {provider.name} on <strong>{fmtMed(appt.date)} at {appt.time}</strong>. The slot will be released for other patients.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep appointment</Button>
          <Button
            variant="danger"
            icon="trash"
            onClick={() => {
              cancelAppointment(appt.id);
              track("appointment_cancelled", { id: appt.id });
              toast("info", `Appointment ${appt.id} cancelled`);
              setCancelOpen(false);
            }}
          >
            Yes, cancel it
          </Button>
        </div>
      </Dialog>

      {/* reschedule dialog */}
      <Dialog open={reschedOpen} onClose={() => setReschedOpen(false)} title="Reschedule appointment" wide>
        <p className="text-[14px] text-ink-2">
          Currently: <strong>{fmtMed(appt.date)} at {appt.time}</strong>. Choose a new time with {provider.name} — the same reason and details carry over.
        </p>
        <div className="mt-5">
          <AvailabilityCalendar
            providerId={provider.id}
            date={newDate}
            time={newTime}
            onPickDate={(d) => { setNewDate(d); setNewTime(null); }}
            onPickTime={setNewTime}
            compact
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-ink-2" aria-live="polite">
            {newDate && newTime ? (
              <>New time: <span className="text-pine-2">{dayLabel(newDate)} · {newTime}</span></>
            ) : (
              "Select a date and time above."
            )}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setReschedOpen(false)}>Back</Button>
            <Button
              disabled={!newDate || !newTime || (newDate === appt.date && newTime === appt.time)}
              icon="check"
              onClick={() => {
                rescheduleAppointment(appt.id, newDate!, newTime!);
                track("appointment_rescheduled", { id: appt.id, date: newDate, time: newTime });
                toast("success", `Appointment moved to ${dayLabel(newDate!)} · ${newTime}`);
                setReschedOpen(false);
              }}
            >
              Confirm new time
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* ================= SAVED ================= */

export function SavedProviders() {
  usePageMeta("Saved providers | CarePoint");
  const { saved } = useApp();
  const providers = useMemo(() => saved.map((id) => getProviderById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p)), [saved]);

  return (
    <div className="container-x py-8">
      <p className="kicker">Your CarePoint</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Saved providers</h1>
      <p className="mt-2 text-[14px] text-ink-2">{providers.length === 0 ? "Your shortlist lives here." : `${providers.length} provider${providers.length > 1 ? "s" : ""} saved on this device.`}</p>

      <div className="mt-6">
        {providers.length === 0 ? (
          <EmptyState
            icon="heart"
            title="No saved providers yet"
            body="Tap the heart on any provider card to build a shortlist you can compare, check availability on and book from one place."
            action={<Button to="/search" icon="search">Browse providers</Button>}
          />
        ) : (
          <div className="anim-stagger grid gap-4 md:grid-cols-2">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>

      {providers.length >= 2 && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-line bg-night px-5 py-4 text-cream">
          <p className="text-[14px] font-semibold">Not sure between them? Put them side by side.</p>
          <Button to="/compare" size="sm" icon="columns">Compare saved</Button>
        </div>
      )}
      {providers.length > 0 && providers.length < 2 && (
        <Badge className="mt-6">Save one more provider to unlock comparison</Badge>
      )}
    </div>
  );
}
