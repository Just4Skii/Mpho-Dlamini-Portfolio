import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ConsultationType, PatientDetails } from "../types";
import { getProviderBySlug } from "../data/providers";
import { getSpecialty } from "../data/specialties";
import { getCity } from "../data/locations";
import { confirmBooking, makeICS } from "../lib/services";
import { useApp, useAvailability } from "../store/store";
import { AvailabilityCalendar } from "../components/calendar/AvailabilityCalendar";
import { Monogram } from "../components/provider/ProviderCard";
import { Button, Field, Input, Select, Spinner } from "../components/ui";
import { Icon } from "../components/icons";
import type { IconName } from "../components/icons";
import { cx, dayLabel, downloadFile, fmtFull, fmtMed, googleDirectionsUrl, track, usePageMeta, zar } from "../lib/utils";
import type { Appointment } from "../types";

const STEPS = [
  { n: 1, label: "Appointment type" },
  { n: 2, label: "Reason" },
  { n: 3, label: "Date & time" },
  { n: 4, label: "Your details" },
  { n: 5, label: "Review" },
];

const TYPE_INFO: Record<ConsultationType, { icon: IconName; title: string; body: string }> = {
  "in-person": { icon: "home", title: "In-person consultation", body: "Visit the practice for a face-to-face consultation." },
  video: { icon: "video", title: "Video consultation", body: "Meet from home — the practice sends a secure video link." },
  "follow-up": { icon: "clock", title: "Follow-up visit", body: "A shorter visit to review progress or results." },
};

export default function BookingPage() {
  const { slug } = useParams();
  const provider = getProviderBySlug(slug);
  const navigate = useNavigate();
  const { draft, setDraft, clearDraft, profile, saveProfile, addAppointment, toast, bookedSlots } = useApp();
  const { next } = useAvailability(provider?.id);

  const [step, setStep] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [saveDetails, setSaveDetails] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  usePageMeta(provider ? `Book ${provider.name} | CarePoint` : "Book an appointment | CarePoint");

  // attach (or re-attach) the draft to this provider
  useEffect(() => {
    if (provider && draft.providerId !== provider.id) {
      setDraft({ providerId: provider.id, type: null, reason: null, date: null, time: null, patient: draft.patient ?? profile });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.id]);

  useEffect(() => {
    if (provider) window.scrollTo({ top: 0 });
  }, [step, provider, confirmed]);

  const fee = useMemo(() => {
    if (!provider) return null;
    return draft.type === "follow-up" ? provider.feeFollowUp : provider.feeConsultation;
  }, [provider, draft.type]);

  if (!provider) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto max-w-lg rounded-xl border border-danger/25 bg-danger-bg p-8 text-center">
          <Icon name="alert" className="mx-auto h-8 w-8 text-danger" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-danger">This provider isn't available for booking</h1>
          <p className="mt-2 text-[14.5px] text-ink-2">The profile you followed doesn't exist or can't take bookings right now. Search the directory to find similar care nearby.</p>
          <Button to="/search" className="mt-6">Search providers</Button>
        </div>
      </div>
    );
  }

  const spec = getSpecialty(provider.specialty);
  const city = getCity(provider.citySlug);

  const goto = (n: number) => {
    track("booking_step_completed", { step, next: n });
    setSlotError(null);
    setStep(n);
  };

  const validateDetails = (p: PatientDetails | null): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!p) return { firstName: "Enter the patient's first name" };
    if (!p.firstName.trim()) e.firstName = "Enter the patient's first name";
    if (!p.lastName.trim()) e.lastName = "Enter the patient's last name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email ?? "")) e.email = "Enter a valid email address";
    if (!/^(\+27|0)[0-9\s-]{8,}$/.test((p.phone ?? "").trim())) e.phone = "Enter a valid South African number, e.g. 082 555 0123";
    return e;
  };

  const doConfirm = () => {
    if (!draft.type || !draft.reason || !draft.date || !draft.time || !draft.patient) return;
    setConfirming(true);
    setSlotError(null);
    window.setTimeout(() => {
      const result = confirmBooking(
        { providerId: provider.id, type: draft.type!, reason: draft.reason!, date: draft.date!, time: draft.time!, patient: draft.patient!, fee },
        bookedSlots,
      );
      setConfirming(false);
      if (!result.ok) {
        setSlotError("That appointment slot is no longer available. Please choose another time.");
        setDraft({ time: null });
        setStep(3);
        track("appointment_slot_selected", { providerId: provider.id, failed: true });
        return;
      }
      if (saveDetails && draft.patient) saveProfile(draft.patient);
      addAppointment(result.appointment);
      track("booking_completed", { providerId: provider.id, id: result.appointment.id });
      toast("success", `Appointment ${result.appointment.id} confirmed`);
      setConfirmed(result.appointment);
      clearDraft();
    }, 750);
  };

  /* ---------- confirmation screen ---------- */
  if (confirmed) {
    return (
      <div className="container-x py-12">
        <div className="mx-auto max-w-2xl">
          <div className="anim-fade-up text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pine text-cream">
              <Icon name="check" className="h-8 w-8" strokeWidth={2.4} />
            </span>
            <p className="kicker mt-5">Appointment request confirmed</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">You're booked in, {confirmed.patient.firstName}.</h1>
            <p className="mt-3 text-[15px] text-ink-2">
              Appointment number <span className="rounded-md bg-pine-3 px-2 py-0.5 font-bold tabular-nums text-pine-2">{confirmed.id}</span> — keep it handy if you need to make changes.
            </p>
          </div>

          <div className="card mt-8 overflow-hidden">
            <div className="grid grid-cols-[110px_1fr] border-b border-line bg-cream">
              <div className="flex items-center justify-center border-r border-line p-4">
                <Monogram id={provider.id} name={provider.name} />
              </div>
              <div className="p-4">
                <p className="font-display text-[17px] font-semibold">{provider.name}</p>
                <p className="text-[13px] text-ink-2">{spec?.name} · {provider.practice}</p>
              </div>
            </div>
            <dl className="grid gap-x-6 gap-y-3 p-5 sm:grid-cols-2">
              {[
                ["Date", fmtFull(confirmed.date)],
                ["Time", confirmed.time],
                ["Type", TYPE_INFO[confirmed.type].title],
                ["Reason", confirmed.reason],
                ["Location", confirmed.type === "video" ? "Video consultation — link to follow" : `${provider.address}, ${city?.name}`],
                ["Fee", zar(confirmed.fee)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] font-bold uppercase tracking-wide text-ink-3">{k}</dt>
                  <dd className="mt-0.5 text-[14.5px] font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <Button variant="outline" icon="download" onClick={() => { downloadFile(`carepoint-${confirmed.id}.ics`, makeICS(confirmed, provider), "text/calendar"); toast("info", "Calendar file downloaded — import it into your calendar app."); }}>
              Add to calendar (.ics)
            </Button>
            <Button to={`/account/appointments/${confirmed.id}`} icon="calendar">View appointment</Button>
            {confirmed.type === "video" ? (
              <Button variant="outline" icon="user" to={`/providers/${provider.slug}`}>View provider profile</Button>
            ) : (
              <Button variant="outline" icon="directions" iconRight="external" href={googleDirectionsUrl(provider.lat, provider.lng, `${provider.practice}, ${provider.suburb}`)}>
                Get directions
              </Button>
            )}
            <Button variant="ghost" to="/">Return home</Button>
          </div>
          <p className="mt-6 rounded-lg border border-line bg-cream px-4 py-3 text-center text-[12.5px] leading-relaxed text-ink-3">
            This is a concept preview: the appointment is saved on this device only. In a live product, the practice would confirm your request and a notification service would follow up. Calendar files are generated locally — no external calendar was updated.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- wizard ---------- */
  return (
    <div className="container-x py-8">
      <Link to={`/providers/${provider.slug}`} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-2 hover:text-pine">
        <Icon name="arrowLeft" className="h-4 w-4" /> Back to {provider.name}
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Book an appointment</h1>

          {/* progress */}
          <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Booking progress">
            {STEPS.map((s, i) => {
              const done = step > s.n;
              const current = step === s.n;
              return (
                <li key={s.n} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-4 bg-line-2" aria-hidden="true" />}
                  <button
                    type="button"
                    onClick={() => done && goto(s.n)}
                    disabled={!done && !current}
                    aria-current={current ? "step" : undefined}
                    className={cx(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                      current && "border-pine bg-pine text-cream",
                      done && "border-pine-4 bg-pine-3 text-pine-2 hover:bg-pine-4/60",
                      !done && !current && "border-line bg-paper text-ink-3",
                    )}
                  >
                    {done ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /> : <span>{s.n}</span>}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {slotError && (
            <div role="alert" className="anim-fade-up mt-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-bg p-4">
              <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              <div>
                <p className="text-[14.5px] font-bold text-danger">{slotError}</p>
                <p className="mt-0.5 text-[13px] text-ink-2">We've returned you to the calendar — nearby times are still open.</p>
              </div>
            </div>
          )}

          <div className="mt-7">
            {step === 1 && (
              <StepShell title="How would you like to meet?" body={`${provider.name} offers these consultation types.`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {provider.consultationTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={draft.type === t}
                      onClick={() => { setDraft({ type: t }); }}
                      onDoubleClick={() => { setDraft({ type: t }); goto(2); }}
                      className={cx(
                        "rounded-xl border p-5 text-left transition-all",
                        draft.type === t ? "border-pine bg-pine-3/50 ring-2 ring-pine/25" : "border-line-2 bg-card hover:border-pine",
                      )}
                    >
                      <span className={cx("flex h-10 w-10 items-center justify-center rounded-lg", draft.type === t ? "bg-pine text-cream" : "bg-paper text-pine")}>
                        <Icon name={TYPE_INFO[t].icon} className="h-5 w-5" />
                      </span>
                      <span className="mt-3 block text-[15px] font-bold">{TYPE_INFO[t].title}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">{TYPE_INFO[t].body}</span>
                      {t === "follow-up" && provider.feeFollowUp !== null && <span className="mt-2 inline-block rounded-md bg-paper px-2 py-0.5 text-[12px] font-bold text-ink-2">{zar(provider.feeFollowUp)}</span>}
                    </button>
                  ))}
                </div>
                <StepNav onBack={() => navigate(`/providers/${provider.slug}`)} onNext={() => goto(2)} nextDisabled={!draft.type} />
              </StepShell>
            )}

            {step === 2 && (
              <StepShell title="What's the reason for this visit?" body="This helps the practice prepare — it isn't a diagnosis and stays on your device.">
                <div className="space-y-2">
                  {provider.services.map((s) => (
                    <label
                      key={s}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all",
                        draft.reason === s ? "border-pine bg-pine-3/50 ring-2 ring-pine/25" : "border-line-2 bg-card hover:border-pine",
                      )}
                    >
                      <input type="radio" name="reason" checked={draft.reason === s} onChange={() => setDraft({ reason: s })} className="peer sr-only" />
                      <span className={cx("flex h-5 w-5 items-center justify-center rounded-full border-2", draft.reason === s ? "border-pine" : "border-line-2")}>
                        {draft.reason === s && <span className="h-2.5 w-2.5 rounded-full bg-pine" />}
                      </span>
                      <span className="text-[14.5px] font-semibold">{s}</span>
                    </label>
                  ))}
                </div>
                <StepNav onBack={() => goto(1)} onNext={() => goto(3)} nextDisabled={!draft.reason} />
              </StepShell>
            )}

            {step === 3 && (
              <StepShell title="Choose a date and time" body={`Showing live availability for ${provider.name} over the next 14 days.`}>
                <AvailabilityCalendar
                  providerId={provider.id}
                  date={draft.date}
                  time={draft.time}
                  onPickDate={(d) => setDraft({ date: d, time: null })}
                  onPickTime={(t) => {
                    setDraft({ time: t });
                    track("appointment_slot_selected", { providerId: provider.id, date: draft.date, time: t });
                  }}
                />
                <StepNav onBack={() => goto(2)} onNext={() => goto(4)} nextDisabled={!draft.date || !draft.time} nextLabel="Continue to your details" />
              </StepShell>
            )}

            {step === 4 && (
              <StepShell title="Your details" body="Only what's needed to confirm the booking — no ID numbers or medical history.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" required error={errors.firstName}>
                    <Input value={draft.patient?.firstName ?? ""} onChange={(e) => setDraft({ patient: { ...(draft.patient as PatientDetails), firstName: e.target.value, lastName: draft.patient?.lastName ?? "", email: draft.patient?.email ?? "", phone: draft.patient?.phone ?? "" } })} error={!!errors.firstName} autoComplete="given-name" />
                  </Field>
                  <Field label="Last name" required error={errors.lastName}>
                    <Input value={draft.patient?.lastName ?? ""} onChange={(e) => setDraft({ patient: { ...(draft.patient as PatientDetails), lastName: e.target.value, firstName: draft.patient?.firstName ?? "", email: draft.patient?.email ?? "", phone: draft.patient?.phone ?? "" } })} error={!!errors.lastName} autoComplete="family-name" />
                  </Field>
                  <Field label="Email" required error={errors.email} hint="Used for your confirmation only.">
                    <Input type="email" value={draft.patient?.email ?? ""} onChange={(e) => setDraft({ patient: { ...(draft.patient as PatientDetails), email: e.target.value, firstName: draft.patient?.firstName ?? "", lastName: draft.patient?.lastName ?? "", phone: draft.patient?.phone ?? "" } })} error={!!errors.email} autoComplete="email" />
                  </Field>
                  <Field label="Phone" required error={errors.phone} hint="South African format, e.g. 082 555 0123">
                    <Input type="tel" value={draft.patient?.phone ?? ""} onChange={(e) => setDraft({ patient: { ...(draft.patient as PatientDetails), phone: e.target.value, firstName: draft.patient?.firstName ?? "", lastName: draft.patient?.lastName ?? "", email: draft.patient?.email ?? "" } })} error={!!errors.phone} autoComplete="tel" />
                  </Field>
                  <Field label="Preferred communication language" hint="Optional — the practice will try to match it.">
                    <Select value={draft.patient?.language ?? ""} onChange={(e) => setDraft({ patient: { ...(draft.patient as PatientDetails), language: e.target.value || undefined, firstName: draft.patient?.firstName ?? "", lastName: draft.patient?.lastName ?? "", email: draft.patient?.email ?? "", phone: draft.patient?.phone ?? "" } })}>
                      <option value="">No preference</option>
                      {["English", "isiZulu", "isiXhosa", "Afrikaans", "Sesotho", "Setswana"].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[13.5px] font-medium text-ink-2">
                  <input type="checkbox" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} className="h-4 w-4 accent-[#14584b]" />
                  Remember these details on this device for next time
                </label>
                <StepNav
                  onBack={() => goto(3)}
                  onNext={() => {
                    const e = validateDetails(draft.patient);
                    setErrors(e);
                    if (Object.keys(e).length === 0) goto(5);
                  }}
                  nextLabel="Review booking"
                />
              </StepShell>
            )}

            {step === 5 && (
              <StepShell title="Please check these details before confirming." body="Nothing is charged — the practice confirms fees at the visit.">
                <div className="overflow-hidden rounded-xl border border-line bg-card">
                  {[
                    { k: "Provider", v: `${provider.name} — ${spec?.name}`, edit: 1 },
                    { k: "Appointment type", v: draft.type ? TYPE_INFO[draft.type].title : "—", edit: 1 },
                    { k: "Reason", v: draft.reason ?? "—", edit: 2 },
                    { k: "Date", v: draft.date ? fmtFull(draft.date) : "—", edit: 3 },
                    { k: "Time", v: draft.time ?? "—", edit: 3 },
                    { k: "Location", v: draft.type === "video" ? "Video consultation" : `${provider.practice}, ${provider.address}, ${city?.name}`, edit: 0 },
                    { k: "Patient", v: draft.patient ? `${draft.patient.firstName} ${draft.patient.lastName}` : "—", edit: 4 },
                    { k: "Contact", v: draft.patient ? `${draft.patient.email} · ${draft.patient.phone}` : "—", edit: 4 },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 last:border-b-0">
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-wide text-ink-3">{row.k}</p>
                        <p className="mt-0.5 text-[14.5px] font-semibold">{row.v}</p>
                      </div>
                      {row.edit > 0 && (
                        <button type="button" onClick={() => goto(row.edit)} className="shrink-0 text-[12.5px] font-bold text-pine hover:underline">
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-cream px-5 py-4">
                    <p className="text-[14px] font-bold">Consultation fee</p>
                    <p className="font-display text-xl font-semibold text-pine-2">{zar(fee)}</p>
                  </div>
                </div>
                <StepNav
                  onBack={() => goto(4)}
                  onNext={doConfirm}
                  nextLabel={confirming ? "Confirming…" : "Confirm appointment"}
                  nextDisabled={confirming}
                  nextIcon={confirming ? undefined : "check"}
                />
              </StepShell>
            )}
          </div>
        </div>

        {/* summary sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line bg-cream p-4">
              <Monogram id={provider.id} name={provider.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-bold">{provider.name}</p>
                <p className="truncate text-[12.5px] text-ink-3">{spec?.name} · {provider.suburb}</p>
              </div>
            </div>
            <dl className="space-y-3 p-4 text-[13.5px]">
              <SummaryRow k="Type" v={draft.type ? TYPE_INFO[draft.type].title : "Not selected"} />
              <SummaryRow k="Reason" v={draft.reason ?? "Not selected"} />
              <SummaryRow k="Date" v={draft.date ? `${dayLabel(draft.date)}, ${fmtMed(draft.date)}` : "Not selected"} />
              <SummaryRow k="Time" v={draft.time ?? "Not selected"} />
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="font-bold">Fee</dt>
                <dd className="font-display text-lg font-semibold text-pine-2">{zar(fee)}</dd>
              </div>
            </dl>
            <div className="border-t border-line bg-paper px-4 py-3">
              <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-3">
                <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine" />
                Your details stay on this device. Next available: {next ? `${dayLabel(next.date)} · ${next.time}` : "none in 14 days"}.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-semibold text-ink-2">{k}</dt>
      <dd className={cx("text-right font-semibold", v === "Not selected" ? "text-ink-3" : "text-ink")}>{v}</dd>
    </div>
  );
}

function StepShell({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="anim-fade-up">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-[14.5px] text-ink-2">{body}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
  nextIcon,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextIcon?: IconName;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
      <Button variant="ghost" icon="arrowLeft" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled} className="min-w-[150px]">
        {nextLabel}
        {nextDisabled ? <Spinner className="h-4 w-4" /> : nextIcon ? <Icon name={nextIcon} className="h-[18px] w-[18px]" /> : <Icon name="arrowRight" className="h-[18px] w-[18px]" />}
      </Button>
    </div>
  );
}
