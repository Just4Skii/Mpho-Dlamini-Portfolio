import React, { useEffect, useMemo, useRef, useState } from 'react';
import { APK_URL, REPO_URL, getPortfolioReturnUrl } from '../config';
import { S, ALL, CAP, FAQS } from '../stickers';
import mockupMain from '../assets/mockup_main.webp';
import mockupScan from '../assets/mockup_scan.webp';
import mockupDialog from '../assets/mockup_dialog.webp';

type CSSVars = React.CSSProperties & Record<string, string>;

export const Landing: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhone, setActivePhone] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // ---- hero transfer stage refs ----
  const tvRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<SVGSVGElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const srcRefs = useRef<Array<HTMLElement | null>>([]);
  const pkRefs = useRef<Array<HTMLElement | null>>([]);

  // ---- sticker wall ----
  const fieldRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const [wallSel, setWallSel] = useState<number | null>(null);
  const wallItems = useMemo(() => {
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: 30 }, (_, i) => {
      const n = ALL[i % ALL.length];
      return {
        n,
        style: {
          '--z': `${Math.round(rnd(64, 124))}px`,
          '--r': `${Math.round(rnd(-14, 14))}deg`,
          '--fd': `${rnd(5, 9).toFixed(1)}s`,
          '--dl': `-${rnd(0, 6).toFixed(1)}s`,
        } as CSSVars,
        html: S(n),
      };
    });
  }, []);

  // ---- rail / steps ----
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const FINE = matchMedia('(pointer:fine)').matches;
    let cancelled = false;

    /* fan + peek stickers (same as original) */
    const fan = root.querySelector('#fan');
    if (fan) {
      fan.innerHTML = ['shock', 'party', 'laugh'].map((n) => S(n)).join('');
      fan.querySelectorAll('svg').forEach((s, i) => {
        const el = s as unknown as HTMLElement;
        el.style.cssText = `left:${i * 28}%;bottom:${i === 1 ? 24 : 0}%;rotate:${[-10, 4, 12][i]}deg;z-index:${i === 1 ? 2 : 1}`;
      });
    }
    const peek = root.querySelector('#peek');
    if (peek) {
      peek.innerHTML = ['side', 'what', 'cry'].map(S).join('');
      peek.querySelectorAll('svg').forEach((s, i) =>
        (s as unknown as HTMLElement).style.setProperty('--r', [-10, 6, -4][i] + 'deg')
      );
    }

    /* hero transfer loop */
    const tv = tvRef.current;
    const tr = trRef.current;
    const chip = chipRef.current;
    const src = srcRefs.current;
    const pk = pkRefs.current;
    const O = ['laugh', 'shock', 'party', 'heart'];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const say = (t: string, c: string) => {
      if (!chip) return;
      const last = chip.lastElementChild;
      if (last) last.textContent = t;
      chip.style.setProperty('--c', c);
    };
    const fill = (a: Array<HTMLElement | null>, on: boolean) =>
      a.forEach((s, i) => {
        if (!s) return;
        s.className = 'sl' + (on ? ' ok' : '');
        s.innerHTML = on ? S(O[i]) : '';
      });
    const ctr = (el: Element) => {
      const a = el.getBoundingClientRect();
      const b = tv!.getBoundingClientRect();
      return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2, a.width];
    };
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function fly(i: number, dur: number): Promise<void> {
      return new Promise((res) => {
        if (!tv || !tr || !src[i] || !pk[i]) return res();
        const [x0, y0, w] = ctr(src[i]!) as [number, number, number];
        const [x1, y1] = ctr(pk[i]!) as [number, number, number];
        const cx = (x0 + x1) / 2 + ((y1 - y0) * 0.3);
        const cy = (y0 + y1) / 2 - ((x1 - x0) * 0.3);
        const el = document.createElement('div');
        el.className = 'fly';
        el.style.width = w + 'px';
        el.innerHTML = S(O[i]);
        tv.appendChild(el);
        tr.insertAdjacentHTML(
          'beforeend',
          `<path d="M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}" pathLength="1" fill="none" stroke="url(#tg)" stroke-width="4" stroke-linecap="round" stroke-dasharray=".3 2" stroke-dashoffset=".3"/>`
        );
        const p = tr.lastElementChild as SVGPathElement;
        const t0 = performance.now();
        (function f(n: number) {
          if (cancelled) {
            el.remove();
            p.remove();
            return res();
          }
          const q = Math.min((n - t0) / dur, 1);
          const e = ease(q);
          const u = 1 - e;
          const x = u * u * x0 + 2 * u * e * cx + e * e * x1;
          const y = u * u * y0 + 2 * u * e * cy + e * e * y1;
          const k = Math.sin(e * Math.PI);
          el.style.transform = `translate(${x - w / 2}px,${y - w / 2}px) rotate(${-14 * k}deg) scale(${1 + 0.18 * k})`;
          p.setAttribute('stroke-dashoffset', String(0.3 - e * 1.3));
          if (q < 1) requestAnimationFrame(f);
          else {
            el.remove();
            p.remove();
            res();
          }
        })(t0);
      });
    }
    let vis = true;
    let visObs: IntersectionObserver | null = null;
    if (tv) {
      if (RM) {
        src.forEach((s, i) => {
          if (s) s.innerHTML = S(O[i]);
        });
        fill(pk, true);
        say('Pack ready', 'var(--acid)');
      } else {
        visObs = new IntersectionObserver((e) => {
          vis = e[0].isIntersecting;
        });
        visObs.observe(tv);
        (async function run() {
          while (!cancelled) {
            src.forEach((s, i) => {
              if (!s) return;
              s.className = 'sl';
              s.innerHTML = S(O[i]);
            });
            fill(pk, false);
            say('Waiting', 'var(--smoke)');
            await sleep(1000);
            for (let i = 0; i < 4; i++) {
              if (cancelled) return;
              while (!vis && !cancelled) await sleep(300);
              if (!i && src[0]) {
                src[0].classList.add('hot');
                say('Found', 'var(--volt)');
                await sleep(1000);
              }
              say('Importing', 'var(--pink)');
              if (src[i]) src[i]!.className = 'sl gone';
              await fly(i, i ? 800 : 1400);
              if (pk[i]) {
                pk[i]!.innerHTML = S(O[i]);
                pk[i]!.className = 'sl ok pop';
              }
              say(`Added ${i + 1}/4`, 'var(--acid)');
              await sleep(i ? 150 : 400);
            }
            say('Pack ready', 'var(--acid)');
            await sleep(2800);
          }
        })();
      }
    }

    /* nav scroll + rail */
    const nav = root.querySelector('#nav');
    const steps = stepsRef.current;
    const onS = () => {
      nav?.classList.toggle('s', window.scrollY > 40);
      if (steps) {
        const r = steps.getBoundingClientRect();
        steps.style.setProperty(
          '--p',
          String(Math.max(0, Math.min(1, ((window.innerHeight * 0.72 - r.top) / r.height) || 0))).slice(0, 5)
        );
      }
    };
    window.addEventListener('scroll', onS, { passive: true });
    onS();

    /* magnetic primary buttons */
    const magnets: Array<{ el: HTMLElement; move: (e: PointerEvent) => void; leave: () => void }> = [];
    if (FINE && !RM) {
      root.querySelectorAll('.btn.p').forEach((b) => {
        const el = b as HTMLElement;
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (e.clientX - r.left - r.width / 2) * 0.12 + 'px');
          el.style.setProperty('--my', (e.clientY - r.top - r.height / 2) * 0.18 + 'px');
        };
        const leave = () => {
          el.style.removeProperty('--mx');
          el.style.removeProperty('--my');
        };
        el.addEventListener('pointermove', move as EventListener);
        el.addEventListener('pointerleave', leave);
        magnets.push({ el, move, leave });
      });
    }

    /* reveal on scroll */
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    root.querySelectorAll('.rv').forEach((e) => io.observe(e));

    /* wall parallax */
    const wall = wallRef.current;
    const field = fieldRef.current;
    const onWallMove = (e: PointerEvent) => {
      if (!wall || !field || !FINE || RM) return;
      const r = wall.getBoundingClientRect();
      (field.style as CSSStyleDeclaration & { translate?: string }).translate =
        `${((e.clientX - r.left) / r.width - 0.5) * -22}px ${((e.clientY - r.top) / r.height - 0.5) * -16}px`;
    };
    wall?.addEventListener('pointermove', onWallMove as EventListener);

    return () => {
      cancelled = true;
      visObs?.disconnect();
      io.disconnect();
      window.removeEventListener('scroll', onS);
      magnets.forEach(({ el, move, leave }) => {
        el.removeEventListener('pointermove', move as EventListener);
        el.removeEventListener('pointerleave', leave);
      });
      wall?.removeEventListener('pointermove', onWallMove as EventListener);
    };
  }, []);

  const returnUrl = getPortfolioReturnUrl();

  const pickWall = (idx: number) => {
    setWallSel(idx);
    if (capRef.current) capRef.current.textContent = CAP[wallItems[idx].n];
  };

  return (
    <div ref={rootRef}>
      <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="sb-sym-bg" cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#1C1C2A" />
            <stop offset="70%" stopColor="#0D0D15" />
            <stop offset="100%" stopColor="#07070B" />
          </radialGradient>
          <linearGradient id="sb-sym-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22E4FF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FF3D9A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#25D366" stopOpacity="0.85" />
          </linearGradient>
          <filter id="sb-sym-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>
        <symbol id="sb-logo" viewBox="0 0 108 108">
          <rect width="108" height="108" rx="26" fill="url(#sb-sym-bg)" />
          <rect x="1" y="1" width="106" height="106" rx="25" fill="none" stroke="url(#sb-sym-ring)" strokeWidth="1.6" />
          <path d="M33 33 h38 c3.3 0 6 2.7 6 6 v26 l-14 14 h-30 c-3.3 0 -6 -2.7 -6 -6 v-34 c0 -3.3 2.7 -6 6 -6 z" fill="#000000" opacity="0.55" />
          <g filter="url(#sb-sym-shadow)">
            <path d="M31 31 h38 c3.3 0 6 2.7 6 6 v26 l-14 14 h-30 c-3.3 0 -6 -2.7 -6 -6 v-34 c0 -3.3 2.7 -6 6 -6 z" fill="#161622" stroke="#FFFFFF" strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M61 63 h14 l-14 14 z" fill="#28283E" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
          <path d="M48 42 c2.5 0 4.5 -1 6 -2.8 v14 c0 4.4 -3.6 8 -8 8 c-4.4 0 -8 -3.6 -8 -8 c0 -4.4 3.6 -8 8 -8 c1.2 0 2.3 0.3 3.3 0.8 v-4 z" fill="#22E4FF" />
          <path d="M51 44 c2.5 0 4.5 -1 6 -2.8 v14 c0 4.4 -3.6 8 -8 8 c-4.4 0 -8 -3.6 -8 -8 c0 -4.4 3.6 -8 8 -8 c1.2 0 2.3 0.3 3.3 0.8 v-4 z" fill="#FF3D9A" />
          <path d="M49.5 43 c2.2 0 4 -0.8 5.2 -2.3 v14 c0 3.8 -3.1 7 -7 7 c-3.8 0 -7 -3.1 -7 -7 c0 -3.8 3.1 -7 7 -7 c1 0 2 0.3 2.8 0.7 v-5.4 z" fill="#FFFFFF" />
          <circle cx="69" cy="33" r="9.5" fill="#25D366" stroke="#0E0E16" strokeWidth="2.4" />
          <path d="M64.5 33.2 l3 3 l6 -6" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </svg>

      <div className="rb m">
        <div className="w">
          <a href={returnUrl}>← GraffGrid</a> / <a href={returnUrl}>Projects</a> /{' '}
          <span style={{ color: '#fff' }}>StickerBridge</span>
        </div>
      </div>

      <header className="nav" id="nav">
        <div className="w ni">
          <a className="brand" href="#top" aria-label="StickerBridge home">
            <svg className="brand-logo" width="34" height="34" viewBox="0 0 108 108" aria-hidden="true">
              <use href="#sb-logo" />
            </svg>
            StickerBridge
          </a>
          <nav id="menu" aria-label="Main" className={menuOpen ? 'open' : ''}>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#app" onClick={() => setMenuOpen(false)}>Product</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a className="mo" href="#get" onClick={() => setMenuOpen(false)}>Download APK</a>
          </nav>
          <a className="btn p sm get" href="#get">Download APK</a>
          <button
            className="bur"
            aria-expanded={menuOpen}
            aria-controls="menu"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h14M3 14h14" />
            </svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="w hg">
            <div>
              <div className="hero-brand rv">
                <svg width="22" height="22" viewBox="0 0 108 108" aria-hidden="true">
                  <use href="#sb-logo" />
                </svg>
                <span className="m tag">Android · Free · Built for stickers</span>
              </div>
              <h1 className="rv">
                TikTok stickers. <span className="hl">WhatsApp</span> ready.
              </h1>
              <p className="lead rv" style={{ '--d': '.1s' } as CSSVars}>
                Turn your favorite TikTok stickers into WhatsApp sticker packs in a few taps.
              </p>
              <div className="cta rv" style={{ '--d': '.2s' } as CSSVars}>
                <a className="btn p" href="#get">
                  Download APK{' '}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 9h12M10 4l5 5-5 5" />
                  </svg>
                </a>
                <a className="btn g" href="#how">See how it works</a>
              </div>
            </div>
            <div className="tv" id="tv" ref={tvRef} role="img" aria-label="Stickers move from a TikTok tray into a WhatsApp sticker pack">
              <div className="card src">
                <span className="m">Source</span>
                <div className="gr">
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} className="sl" ref={(el) => { srcRefs.current[i] = el; }} />
                  ))}
                </div>
              </div>
              <div className="card pk">
                <span className="m">WhatsApp pack</span>
                <div className="gr">
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} className="sl" ref={(el) => { pkRefs.current[i] = el; }} />
                  ))}
                </div>
              </div>
              <div className="chip m" aria-live="polite" ref={chipRef}>
                <b />
                <span>Waiting</span>
              </div>
              <svg className="tr" ref={trRef} aria-hidden="true">
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#22E4FF" />
                    <stop offset=".4" stopColor="#7B4DFF" />
                    <stop offset=".7" stopColor="#FF3D9A" />
                    <stop offset="1" stopColor="#C6FF3D" />
                  </linearGradient>
                </defs>
              </svg>
              <i className="dec fl" style={{ '--r': '-12deg', top: '-26px', left: '30%' } as CSSVars} dangerouslySetInnerHTML={{ __html: S('star') }} />
              <i className="dec fl" style={{ '--r': '10deg', bottom: '-30px', right: '-14px', '--dl': '1s' } as CSSVars} dangerouslySetInnerHTML={{ __html: S('fire') }} />
            </div>
          </div>
        </section>

        <section className="proof">
          <div className="w">
            <h2 className="rv">Made for the way you actually use stickers.</h2>
            <ul className="rv">
              <li><i style={{ '--c': 'var(--volt)' } as CSSVars} />One-tap conversion</li>
              <li><i style={{ '--c': 'var(--pink)' } as CSSVars} />Sticker packs</li>
              <li><i style={{ '--c': 'var(--acid)' } as CSSVars} />Android native</li>
              <li><i style={{ '--c': 'var(--ember)' } as CSSVars} />Fast export</li>
              <li><i style={{ '--c': 'var(--uv)' } as CSSVars} />Clean interface</li>
            </ul>
          </div>
        </section>

        <section className="light" id="how">
          <div className="w">
            <h2 className="rv">Three steps. That&apos;s it.</h2>
            <div className="steps" id="steps" ref={stepsRef}>
              <div className="rail" aria-hidden="true"><i /></div>
              <div className="st rv">
                <div className="n">01</div>
                <h3>Find a sticker</h3>
                <p>Spot one you love on TikTok.</p>
                <div className="vis">
                  <i className="sl" dangerouslySetInnerHTML={{ __html: S('laugh') }} />
                  <i className="sl hot" dangerouslySetInnerHTML={{ __html: S('shock') }} />
                  <i className="sl" dangerouslySetInnerHTML={{ __html: S('party') }} />
                </div>
              </div>
              <div className="st rv" style={{ '--d': '.1s' } as CSSVars}>
                <div className="n">02</div>
                <h3>Move it</h3>
                <p>Bring it into the app. Sticker secured.</p>
                <div className="vis">
                  <span className="mv" style={{ width: '58px' }} dangerouslySetInnerHTML={{ __html: S('shock') }} />
                  <span className="m" style={{ color: '#7B4DFF' }}>Importing</span>
                </div>
              </div>
              <div className="st rv" style={{ '--d': '.2s' } as CSSVars}>
                <div className="n">03</div>
                <h3>Use it</h3>
                <p>Add the pack to WhatsApp and send it.</p>
                <div className="vis">
                  <div style={{ display: 'grid', gap: '8px', justifyItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['laugh', 'shock', 'heart'].map((n) => (
                        <i key={n} className="sl ok" style={{ borderColor: '#25D366', background: '#e6fbe9' }} dangerouslySetInnerHTML={{ __html: S(n) }} />
                      ))}
                    </div>
                    <span className="tg m">Pack ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dark2" id="app">
          <div className="w">
            <div className="app-head rv">
              <span className="m tag" style={{ color: 'var(--volt)' }}>● Android Native Experience</span>
              <h2 style={{ marginTop: '8px', maxWidth: '14ch' }}>Small app. Big sticker energy.</h2>
              <p className="sub">
                1-Tap cache scanner extracts your favorited TikTok stickers and converts them directly into WhatsApp packs with lossless 512×512 WebP and animated sticker support.
              </p>
            </div>
            <div className="ps rv" id="ps">
              <div className={`ph l${activePhone === 0 ? ' active' : ''}`} title="Tap to inspect Auto-Scan screen" onClick={() => setActivePhone(0)}>
                <div className="ph-bar" />
                <div className="ph-glare" />
                <div className="sc">
                  <img src={mockupScan} alt="StickerBridge 1-Tap Auto-Scan Ingestion" className="ph-img" loading="lazy" />
                  <div className="ph-tag m"><span>01</span> Auto-Scan</div>
                </div>
              </div>
              <div className={`ph r${activePhone === 1 ? ' active' : ''}`} title="Tap to inspect WhatsApp Pack screen" onClick={() => setActivePhone(1)}>
                <div className="ph-bar" />
                <div className="ph-glare" />
                <div className="sc">
                  <img src={mockupDialog} alt="StickerBridge WhatsApp Sticker Pack Ready to Add" className="ph-img" loading="lazy" />
                  <div className="ph-tag m"><span>03</span> WhatsApp Ready</div>
                </div>
              </div>
              <div className={`ph c${activePhone === 2 ? ' active' : ''}`} title="StickerBridge Home Studio" onClick={() => setActivePhone(2)}>
                <div className="ph-bar" />
                <div className="ph-glare" />
                <div className="sc">
                  <img src={mockupMain} alt="StickerBridge Main Dashboard and Favorited Sticker Packs" className="ph-img" loading="lazy" />
                  <div className="ph-tag m"><span>02</span> Curated Packs</div>
                </div>
              </div>
              <div className="fc m fl" style={{ '--c': 'var(--volt)', left: '4%', top: '12%', '--dl': '.4s' } as CSSVars}><i />⚡ 1-Tap Auto-Scan</div>
              <div className="fc m fl" style={{ '--c': 'var(--pink)', right: '3%', top: '30%', '--fd': '7s' } as CSSVars}><i />✨ Lossless 512×512 WebP</div>
              <div className="fc m fl" style={{ '--c': 'var(--mint)', left: '8%', bottom: '10%', '--dl': '1.2s' } as CSSVars}><i />🟢 Added to WhatsApp</div>
            </div>
          </div>
        </section>

        <section className="light" id="features">
          <div className="w">
            <h2 className="rv" style={{ maxWidth: '14ch' }}>One idea. Done properly.</h2>
            <div className="bn">
              <article className="bc b1 rv">
                <h3>Turn one sticker into a whole pack.</h3>
                <p>Start with the one you found. Keep adding until the pack feels right.</p>
                <div className="fan" id="fan" />
              </article>
              <article className="bc b2 rv" style={{ '--d': '.1s' } as CSSVars}>
                <h3>Built for Android.</h3>
                <p>A native app, not a website in disguise.</p>
              </article>
              <article className="bc b3 rv" style={{ '--d': '.15s' } as CSSVars}>
                <h3>Fast and simple.</h3>
                <p>Find, move, use.</p>
                <span className="big" aria-hidden="true">3</span>
              </article>
              <article className="bc b4 rv">
                <h3>Your stickers stay yours.</h3>
                <p>You pick what goes in the pack and what gets sent.</p>
                <div className="peek" id="peek" />
              </article>
            </div>
          </div>
        </section>

        <section className="wall" ref={wallRef}>
          <div className="w">
            <h2 className="rv">Your conversations just got more expressive.</h2>
            <p className="cap m" id="cap" ref={capRef} aria-live="polite">Pick a mood</p>
            <div
              id="field"
              ref={fieldRef}
              onClick={(e) => {
                const b = (e.target as HTMLElement).closest('.sk');
                if (!b) return;
                pickWall(Number((b as HTMLElement).dataset.i));
              }}
              onPointerMove={(e) => {
                if (!matchMedia('(pointer:fine)').matches) return;
                const b = (e.target as HTMLElement).closest('.sk') as HTMLElement | null;
                if (!b) return;
                const r = b.getBoundingClientRect();
                b.style.setProperty('--t', ((e.clientX - r.left) / r.width - 0.5) * 18 + 'deg');
                if (capRef.current) capRef.current.textContent = CAP[b.dataset.n || ''];
              }}
              onPointerOut={(e) => {
                const b = (e.target as HTMLElement).closest('.sk') as HTMLElement | null;
                if (b) b.style.setProperty('--t', '0deg');
              }}
            >
              {wallItems.map((w, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sk${wallSel === i ? ' on' : ''}`}
                  aria-label={CAP[w.n]}
                  data-n={w.n}
                  data-i={i}
                  style={w.style}
                  dangerouslySetInnerHTML={{ __html: w.html }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="light why">
          <div className="w">
            <h2 className="rv">You found the perfect sticker. Why should it stay trapped in one app?</h2>
            <div className="trio">
              <span className="rv" style={{ color: 'var(--uv)' }}>Move it.</span>
              <span className="rv" style={{ '--d': '.12s', color: '#E0701A' } as CSSVars}>Pack it.</span>
              <span className="rv" style={{ '--d': '.24s' } as CSSVars}>Send it.</span>
            </div>
          </div>
        </section>

        <section className="dark2">
          <div className="w bg2">
            <div className="rv">
              <h2>Behind the build</h2>
              <p className="sub">StickerBridge started as one annoying problem: great stickers, wrong app.</p>
              <div className="lk">
                <a href={REPO_URL} target="_blank" rel="noopener">GitHub Repository <span>→</span></a>
                <a href="#get">Direct APK Download <span>→</span></a>
                <a href={`${REPO_URL}#readme`} target="_blank" rel="noopener">Technical Breakdown <span>→</span></a>
              </div>
            </div>
            <div className="rows rv" style={{ '--d': '.1s' } as CSSVars}>
              <div><b>The problem</b><p>Stickers you find in one app can&apos;t be used where you actually chat.</p></div>
              <div><b>The approach</b><p>An Android app that moves a sticker from where you found it into a WhatsApp-ready pack.</p></div>
              <div><b>What I built</b><p>The app, its interface, and this page, including the StickerBridge identity icon, device mockup, and every sticker drawn as SVG.</p></div>
              <div><b>This page</b><p>A faithful React port of the original standalone page - same design, same interactions.</p></div>
              <div><b>Built by</b><p>Mpho · GraffGrid</p></div>
            </div>
          </div>
        </section>

        <section className="fin" id="get">
          <div className="w">
            <div className="rv">
              <span className="m tag" style={{ color: '#3DDC84' }}>● Free Android Download</span>
              <h2 style={{ marginTop: '8px' }}>Ready to move your stickers?</h2>
              <p className="sub" style={{ margin: '16px auto 0' }}>
                Download the direct Android APK to start creating and exporting sticker packs to WhatsApp in seconds.
              </p>
            </div>

            <div className="dl-card rv" style={{ '--d': '.15s' } as CSSVars}>
              <div className="dl-head">
                <svg className="droid-icon" viewBox="0 0 24 24" fill="#3DDC84" aria-hidden="true">
                  <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.67 2.23 12.61 2 11.5 2c-1.11 0-2.17.23-3.14.63L6.88 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C5.64 4.36 4.41 6.28 4.26 8.5h14.48c-.15-2.22-1.38-4.14-3.21-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <div className="m tag" style={{ color: '#3DDC84' }}>Android Universal APK</div>
                  <h3 style={{ fontSize: '1.6rem', marginTop: '2px', color: '#fff' }}>StickerBridge v1.0.0</h3>
                </div>
              </div>

              <div className="dl-act">
                <a className="btn dl" href={APK_URL} download="stickerbridge.apk">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download APK (Direct Install)
                </a>
                <div className="dl-chips m">
                  <span><i />Any Android Phone</span>
                  <span><i />Android 8.0 through 15+</span>
                  <span><i />~20 MB</span>
                  <span><i />100% Free · No Store Fees</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--smoke)' }}>
                  Direct repo link:{' '}
                  <a href={APK_URL} style={{ color: 'var(--volt)', textDecoration: 'underline' }} download="stickerbridge.apk">
                    Download raw APK from GitHub
                  </a>{' '}
                  ·{' '}
                  <a href={REPO_URL} target="_blank" rel="noopener" style={{ color: '#fff', textDecoration: 'underline' }}>
                    Source Code
                  </a>
                </div>
              </div>

              <div className="inst-grid">
                <div className="inst-box">
                  <b>1</b>
                  <h4>Download APK</h4>
                  <p>Tap download to save <code>stickerbridge.apk</code> directly to your device.</p>
                </div>
                <div className="inst-box">
                  <b>2</b>
                  <h4>Tap to Install</h4>
                  <p>Open the file from notifications and confirm install. Allow unknown sources if asked.</p>
                </div>
                <div className="inst-box">
                  <b>3</b>
                  <h4>1-Tap Scan</h4>
                  <p>Open StickerBridge and tap ⚡ 1-Tap Auto-Scan to send your stickers to WhatsApp!</p>
                </div>
              </div>
            </div>

            <div className="faq" id="faq">
              <h3 className="rv">Questions</h3>
              <div id="qs">
                {FAQS.map(([q, a], i) => (
                  <div key={i} className={`q${openFaq === i ? ' o' : ''}`}>
                    <button aria-expanded={openFaq === i} aria-controls={`a${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      {q}
                      <i>+</i>
                    </button>
                    <div className="an" id={`a${i}`} role="region">
                      <div>
                        <p>{a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="w">
          <div className="fg">
            <a className="brand" href="#top" style={{ color: '#fff' }}>
              <svg className="brand-logo" width="30" height="30" viewBox="0 0 108 108" aria-hidden="true">
                <use href="#sb-logo" />
              </svg>
              StickerBridge
            </a>
            <nav aria-label="Footer">
              <a href="#app">Product</a>
              <a href="#how">How it works</a>
              <a href="#faq">FAQ</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
              <a href={returnUrl}>GraffGrid</a>
            </nav>
          </div>
          <p className="disc">
            TikTok and WhatsApp are trademarks of their respective owners. StickerBridge is an independent product and is not affiliated with or endorsed by either company.
          </p>
          <p className="disc">© 2026 StickerBridge · Built by Mpho</p>
        </div>
      </footer>
    </div>
  );
};
