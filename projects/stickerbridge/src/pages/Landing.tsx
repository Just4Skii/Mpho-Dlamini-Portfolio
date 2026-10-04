import React, { useState } from 'react';
import {
  Zap,
  Smartphone,
  MessageCircle,
  Download,
  Github,
  ArrowRight,
  Check,
  ChevronDown,
  ScanSearch,
  Layers,
  Film,
  Link2,
  Database,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { APK_URL, REPO_URL, APP_VERSION, APP_SIZE } from '../config';
import mockupMain from '../assets/mockup_main.webp';
import mockupScan from '../assets/mockup_scan.webp';
import mockupDialog from '../assets/mockup_dialog.webp';
import appIcon from '../assets/stickerbridge_icon.svg';

const STEPS = [
  {
    n: '01',
    title: 'Find a sticker',
    desc: 'Spot one you love on TikTok — in chats, comments, or your favorites.',
  },
  {
    n: '02',
    title: 'Move it',
    desc: 'Bring it into StickerBridge with 1-tap auto-scan or a pasted link. Sticker secured.',
  },
  {
    n: '03',
    title: 'Use it',
    desc: 'Add the pack to WhatsApp and send it. Animated stickers keep animating.',
  },
];

const FEATURES = [
  {
    icon: ScanSearch,
    title: '1-Tap Auto-Scan',
    desc: 'Automatically scans TikTok media storage and cache directories for your saved and favorited stickers — no file digging through Scoped Storage.',
  },
  {
    icon: Film,
    title: 'Lossless Animated WebP',
    desc: 'Custom VP8X/ANMF parser preserves every animation frame, duration, and transparency channel while normalizing to the required 512×512 canvas.',
  },
  {
    icon: Link2,
    title: 'Link & Carousel Ingestion',
    desc: 'Paste any TikTok video or photo carousel link to extract every slide. Sets of 1–2 auto-pad to satisfy WhatsApp’s 3-sticker pack minimum.',
  },
  {
    icon: Database,
    title: 'Official ContentProvider',
    desc: 'Native Android ContentProvider compliant with WhatsApp’s sticker specification streams packs securely across process boundaries.',
  },
  {
    icon: Palette,
    title: 'Compose Material 3 UI',
    desc: 'Reactive Jetpack Compose interface with dark mode, instant pack previews, and one-tap WhatsApp export actions.',
  },
  {
    icon: Smartphone,
    title: 'Universal Android',
    desc: 'Runs on Android 8.0 (Oreo, API 26) all the way through Android 15+ (API 35) from a single ~20 MB install.',
  },
];

const SPECS = [
  { k: 'Canvas', v: '512 × 512 exact' },
  { k: 'Static budget', v: '≤ 100 KB WebP' },
  { k: 'Animated budget', v: '≤ 500 KB VP8X + ANMF' },
  { k: 'Pack minimum', v: '≥ 3 stickers (auto-padded)' },
];

const ENGINES = [
  { file: 'TikTokCacheScanner.kt', role: '1-tap discovery across TikTok caches with magic-byte signature filtering.' },
  { file: 'WebpProcessingEngine.kt', role: 'RIFF/VP8X header parsing, 512×512 normalize, sub-500KB animated compliance.' },
  { file: 'TikTokIngester.kt', role: 'Shortlink resolution, carousel JSON unescaping, 3-sticker padding.' },
  { file: 'StickerContentProvider.kt', role: 'WhatsApp queries packs and streams .webp buffers via IPC.' },
];

const FAQS = [
  {
    q: 'Is StickerBridge free?',
    a: 'Yes — 100% free with no store fees, no subscriptions, and no locked exports. It is distributed as a direct-install open-source APK.',
  },
  {
    q: 'Why do I install it outside the Play Store?',
    a: 'Direct distribution keeps the app free and independent. Download the APK, open it from notifications, allow “install unknown apps” once when asked, and you are done.',
  },
  {
    q: 'Do animated stickers keep animating in WhatsApp?',
    a: 'Yes. The engine parses VP8X/ANMF chunks instead of collapsing to a single frame, so frame timing and transparency survive the 512×512 conversion under WhatsApp’s 500KB cap.',
  },
  {
    q: 'Which Android versions are supported?',
    a: 'Android 8.0 (Oreo / API 26) through Android 15+ (API 35), including the Scoped Storage restrictions of Android 11–15 that the auto-scanner works around.',
  },
  {
    q: 'Is it affiliated with TikTok or WhatsApp?',
    a: 'No. StickerBridge is an independent product and is not affiliated with or endorsed by either company. Both names remain trademarks of their respective owners.',
  },
];

function TransferDemo() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-night-2 px-5 py-4" aria-hidden="true">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
        <MessageCircle size={20} />
      </div>
      <div className="relative h-8 w-32 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-bridge-transfer absolute left-0 top-1 text-2xl"
            style={{ animationDelay: `${i * 0.85}s` }}
          >
            ⚡
          </span>
        ))}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bridge text-night">
        <Zap size={20} />
      </div>
      <div className="ml-1 text-xs font-semibold uppercase tracking-widest text-muted">
        Source → WhatsApp pack
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-cream">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-bridge transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p>}
    </div>
  );
}

export const Landing: React.FC = () => {
  return (
    <main>
      {/* NAV */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-2 pt-16">
        <a href="#top" className="flex items-center gap-2.5">
          <img src={appIcon} alt="StickerBridge icon" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight">StickerBridge</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex" aria-label="Page sections">
          <a href="#how" className="transition-colors hover:text-cream">How it works</a>
          <a href="#features" className="transition-colors hover:text-cream">Features</a>
          <a href="#tech" className="transition-colors hover:text-cream">Tech</a>
          <a href="#faq" className="transition-colors hover:text-cream">FAQ</a>
        </nav>
        <a
          href={APK_URL}
          className="inline-flex items-center gap-2 rounded-full bg-bridge px-5 py-2.5 text-sm font-bold text-night transition-transform hover:-translate-y-0.5"
        >
          <Download size={16} /> Download APK
        </a>
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
            <span className="animate-bridge-pulse-dot h-1.5 w-1.5 rounded-full bg-bridge" />
            Android · Free · Native
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            TikTok stickers.
            <br />
            <span className="text-bridge">WhatsApp ready.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Turn your favorite TikTok stickers into WhatsApp sticker packs in a few taps —
            with lossless 512×512 WebP and animated sticker support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={APK_URL}
              className="inline-flex items-center gap-2 rounded-full bg-bridge px-7 py-3.5 text-sm font-bold text-night transition-transform hover:-translate-y-0.5"
            >
              <Download size={17} /> Download APK
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-card px-7 py-3.5 text-sm font-bold text-cream transition-colors hover:border-bridge"
            >
              See how it works <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-6">
            <TransferDemo />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-faint">
            <span>Any Android phone · 8.0 through 15+</span>
            <span>{APP_SIZE} · {APP_VERSION}</span>
            <span>100% free · No store fees</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="animate-bridge-float overflow-hidden rounded-[2rem] border border-line-2 shadow-2xl shadow-bridge/10">
            <img src={mockupMain} alt="StickerBridge dashboard on Android" className="h-auto w-full" loading="eager" />
          </div>
          <div className="absolute -left-6 top-8 hidden rounded-2xl border border-line bg-card/95 px-4 py-3 text-xs shadow-xl backdrop-blur sm:block">
            <div className="font-bold text-bridge">⚡ 1-Tap Auto-Scan</div>
            <div className="mt-0.5 text-muted">Favorited stickers found</div>
          </div>
          <div className="absolute -right-4 bottom-10 hidden rounded-2xl border border-line bg-card/95 px-4 py-3 text-xs shadow-xl backdrop-blur sm:block">
            <div className="font-bold text-bridge">🟢 Added to WhatsApp</div>
            <div className="mt-0.5 text-muted">Pack ready to send</div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="border-y border-line bg-night-2">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 lg:grid-cols-4">
          {[
            { t: '1-Tap conversion', d: 'Scan → pack → send' },
            { t: 'Animated kept animated', d: 'VP8X/ANMF preserved' },
            { t: 'WhatsApp-compliant', d: '512×512 · audited sizes' },
            { t: 'Direct install', d: 'No account · no paywall' },
          ].map((s) => (
            <div key={s.t} className="px-4 py-5">
              <div className="font-bold">{s.t}</div>
              <div className="mt-0.5 font-mono text-xs text-faint">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16 lg:py-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">How it works</div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Three steps. That&apos;s it.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-3xl border border-line bg-card p-7">
              <div className="font-mono text-sm font-bold text-bridge">{s.n}</div>
              <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-8 rounded-3xl border border-line bg-night-2 p-7 sm:p-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-line">
            <img src={mockupScan} alt="1-tap auto-scan finding stickers" className="h-auto w-full" loading="lazy" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">Small app. Big sticker energy.</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The 1-tap cache scanner extracts your favorited TikTok stickers and converts them
              directly into WhatsApp packs — curated the way you like, kept on your device,
              under your control.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {['Auto-scan finds favorited stickers', 'Curated packs — you pick what ships', 'Your stickers stay yours'].map((li) => (
                <li key={li} className="flex items-start gap-2.5">
                  <Check size={16} className="mt-0.5 shrink-0 text-bridge" />
                  <span className="text-cream/90">{li}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-y border-line bg-night-2">
        <div className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16 lg:py-20">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">Product features</div>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            One idea. Done properly.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-line bg-card p-7 transition-colors hover:border-bridge/60">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bridge-soft text-bridge">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 overflow-hidden rounded-3xl border border-line">
            <img src={mockupDialog} alt="WhatsApp-ready sticker pack dialog" className="h-auto w-full" loading="lazy" />
          </div>
        </div>
      </section>

      {/* TECH */}
      <section id="tech" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16 lg:py-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">Behind the build</div>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Started as one annoying problem: great stickers, wrong app.
        </h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-card p-7">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-bridge">
              <Layers size={15} /> Pipeline
            </div>
            <ol className="mt-4 space-y-4">
              {[
                { t: 'Discovery', d: 'Auto-scan TikTok caches + resolve pasted links and carousels.' },
                { t: 'Processing', d: 'Lossless 512×512 normalize; animated frames preserved under budget.' },
                { t: 'Packaging', d: 'ContentProvider serves packs; intent hands them to WhatsApp.' },
              ].map((p, i) => (
                <li key={p.t} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bridge font-mono text-xs font-bold text-night">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold">{p.t}</div>
                    <div className="mt-0.5 text-sm text-muted">{p.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-line bg-card p-7">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-bridge">
              <ShieldCheck size={15} /> WhatsApp spec compliance
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {SPECS.map((s) => (
                <div key={s.k} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-muted">{s.k}</dt>
                  <dd className="font-mono font-bold text-cream">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ENGINES.map((e) => (
            <div key={e.file} className="rounded-2xl border border-line bg-night-2 px-5 py-4">
              <div className="font-mono text-[13px] font-bold text-bridge">{e.file}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-muted">{e.role}</div>
            </div>
          ))}
        </div>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cream underline decoration-bridge decoration-2 underline-offset-4 hover:text-bridge"
        >
          <Github size={16} /> GitHub repository <ArrowRight size={15} />
        </a>
      </section>

      {/* DOWNLOAD */}
      <section className="border-t border-line bg-night-2">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid items-center gap-10 rounded-3xl border border-bridge/30 bg-card p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-bridge-soft px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-bridge">
                <Sparkles size={13} /> Free Android download
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to move your stickers?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Download the direct Android APK and start creating WhatsApp packs in seconds.
                Universal build · Android 8.0 through 15+ · {APP_SIZE} · {APP_VERSION}.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={APK_URL}
                  className="inline-flex items-center gap-2 rounded-full bg-bridge px-7 py-3.5 text-sm font-bold text-night transition-transform hover:-translate-y-0.5"
                >
                  <Download size={17} /> Download APK
                </a>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-2 px-7 py-3.5 text-sm font-bold text-cream transition-colors hover:border-bridge"
                >
                  <Github size={16} /> Source code
                </a>
              </div>
            </div>
            <ol className="space-y-4">
              {[
                { t: 'Download', d: 'Tap download to save stickerbridge.apk directly to your device.' },
                { t: 'Install', d: 'Open the file from notifications and confirm. Allow unknown sources if asked.' },
                { t: '1-Tap Scan', d: 'Open StickerBridge, tap ⚡ 1-Tap Auto-Scan, and send stickers to WhatsApp.' },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-4 rounded-2xl border border-line bg-night-2 p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bridge font-mono text-sm font-bold text-night">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold">{s.t}</div>
                    <div className="mt-0.5 text-sm text-muted">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-8 px-6 py-16 lg:py-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">Questions</div>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">FAQ</h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-faint sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <img src={appIcon} alt="" className="h-7 w-7 rounded-lg" />
            <span>© 2026 StickerBridge · Built by Mpho</span>
          </div>
          <a href="/work" className="font-semibold text-muted transition-colors hover:text-bridge">
            ← GraffGrid
          </a>
        </div>
        <p className="mx-auto max-w-6xl px-6 pb-10 text-xs leading-relaxed text-faint/70">
          TikTok and WhatsApp are trademarks of their respective owners. StickerBridge is an
          independent product and is not affiliated with or endorsed by either company.
        </p>
      </footer>
    </main>
  );
};
