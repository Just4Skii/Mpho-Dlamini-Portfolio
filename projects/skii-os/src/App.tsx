import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Backdrop } from './components/Backdrop';
import { ControlDeck } from './components/ControlDeck';
import { ReturnToPortfolio } from './components/ReturnToPortfolio';
import { type AmbienceFamily } from './engine/ambience';
import { useRealmOrder, useRealms } from './engine/realms';
import { ENTERTAINMENT, PINNED, TRACKS } from './data/apps';

type Tab = 'HOME' | 'APP LIBRARY' | 'SETTINGS' | 'STUDIO';

const MODEL = 'SKYWORTH 32E5400H CINEMA DECK';

export default function App() {
  const { realms } = useRealms();
  const { order, shuffle, position, setPosition } = useRealmOrder(realms);

  const stageRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>('HOME');
  const [ambient, setAmbient] = useState(false);
  const [particleMode, setParticleMode] = useState(2);
  const [fogLevel, setFogLevel] = useState(1);
  const [familyOverride, setFamilyOverride] = useState<AmbienceFamily | 'auto'>('auto');
  const [deckOpen, setDeckOpen] = useState(false);

  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [playerOpen, setPlayerOpen] = useState(true);

  const realmIndex = order.length ? order[Math.min(position, order.length - 1)] : 0;
  const realm = realms[realmIndex] ?? realms[0];

  const family: AmbienceFamily = familyOverride === 'auto'
    ? (realm?.ambient ?? 'starlight')
    : familyOverride;

  const nextRealm = useCallback(() => {
    if (order.length) setPosition((p) => (p + 1) % order.length);
  }, [order.length, setPosition]);

  const prevRealm = useCallback(() => {
    if (order.length) setPosition((p) => (p - 1 + order.length) % order.length);
  }, [order.length, setPosition]);

  // --- keep the 1280x720 stage filling the window, letterboxed ---
  useEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
      stage.style.transform = `scale(${scale})`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // --- the mini player clock ---
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.35;
        if (next >= TRACKS[trackIndex].length) {
          setTrackIndex((t) => (t + 1) % TRACKS.length);
          return 0;
        }
        return next;
      });
    }, 1000 / 30);
    return () => window.clearInterval(id);
  }, [playing, trackIndex]);

  // --- keyboard, the way a remote drives the set-top box ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': nextRealm(); break;
        case 'ArrowLeft': prevRealm(); break;
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          break;
        case ' ':
          e.preventDefault();
          setPlaying((p) => !p);
          break;
        case 'n': case 'N':
          setTrackIndex((t) => (t + 1) % TRACKS.length);
          break;
        case 'a': case 'A':
          setAmbient((a) => !a);
          break;
        case 's': case 'S':
          shuffle();
          break;
        case 'd': case 'D':
          setDeckOpen((d) => !d);
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextRealm, prevRealm, shuffle]);

  // --- the wall-clock, ticking every second ---
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const track = TRACKS[trackIndex];
  const accent = realm?.acc1 ?? '#FFC65C';
  const accent2 = realm?.acc2 ?? '#7FA6C9';

  const shelf = useMemo(() => PINNED, []);

  if (!realm) return null;

  return (
    <div className="skii-root">
      <div className="skii-stage" ref={stageRef} style={{ ['--accent' as string]: accent, ['--accent-2' as string]: accent2 }}>
        <Backdrop
          wallpaper={realm.file}
          family={family}
          accent={accent}
          secondaryAccent={accent2}
          particleMode={particleMode}
          fogLevel={family === 'fog' ? 2 : fogLevel}
          cinematic={ambient}
        />

        <div className={`skii-ui${ambient ? ' skii-ui--dissolved' : ''}`}>
          <header className="skii-topnav">
            <div className="skii-brand">
              <span className="skii-wordmark">SKII</span>
              <span className="skii-badge">TV / SKII</span>
            </div>
            <nav className="skii-tabs">
              {(['HOME', 'APP LIBRARY', 'SETTINGS', 'STUDIO'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`skii-tab${tab === t ? ' is-active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  <span className="skii-tab-label">{t}</span>
                  {t === 'HOME' && <span className="skii-tab-sub">● ACTIVE</span>}
                </button>
              ))}
            </nav>
            <div className="skii-status">
              <span className="skii-chip">RAM 306 / 913 MB FREE</span>
              <span className="skii-chip skii-chip--net">● WI-FI ONLINE</span>
              <div className="skii-clock">
                <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</strong>
                <span>{now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}</span>
              </div>
            </div>
          </header>

          <section className="skii-realm">
            <div className="skii-kicker">
              <span className="skii-kicker-diamond">◆</span>
              <span>{realm.subtitle}</span>
              <span className="skii-kicker-dot">·</span>
              <span>{MODEL}</span>
            </div>
            <div className="skii-title-row">
              <h1 className="skii-title">{realm.title}</h1>
              {playerOpen && (
                <div className="skii-miniplayer" role="group" aria-label="Now playing">
                  <div className="skii-miniplayer-text">
                    <span className="skii-miniplayer-track">{track.title}</span>
                    <span className="skii-miniplayer-artist">{track.album}</span>
                    <div className="skii-miniplayer-bar">
                      <span style={{ width: `${(progress / track.length) * 100}%` }} />
                    </div>
                  </div>
                  <button type="button" className="skii-mp-btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
                    {playing ? '❚❚' : '▶'}
                  </button>
                  <button type="button" className="skii-mp-btn" onClick={() => setTrackIndex((t) => (t + 1) % TRACKS.length)} aria-label="Next track">▶❙</button>
                  <button type="button" className="skii-mp-btn skii-mp-btn--close" onClick={() => setPlayerOpen(false)} aria-label="Close player">✕</button>
                </div>
              )}
            </div>
            <p className="skii-lore">{realm.lore}</p>
          </section>

          <section className="skii-herorow">
            <button type="button" className="skii-hero is-primary" onClick={() => setPlaying(true)}>
              <span className="skii-hero-title">▶ Launch Spotify</span>
              <span className="skii-hero-sub">FEATURED / QUICK RESUME</span>
            </button>
            <button type="button" className="skii-hero" onClick={nextRealm}>
              <span className="skii-hero-title">✦ Next Anime Realm</span>
              <span className="skii-hero-sub">SWITCH THEME &amp; ART</span>
            </button>
            <button type="button" className="skii-hero" onClick={() => setAmbient(true)}>
              <span className="skii-hero-title">🌄 Ambient Mode</span>
              <span className="skii-hero-sub">SKII WALLPAPER</span>
            </button>
            <button type="button" className="skii-hero">
              <span className="skii-hero-title">📺 Live TV &amp; HDMI</span>
              <span className="skii-hero-sub">INPUTS / TUNER</span>
            </button>
          </section>

          <section className="skii-shelf">
            <div className="skii-section-head">
              <h2>★ PINNED FAVORITES</h2>
              <p>Press OK to launch · Hold OK or press MENU for options</p>
            </div>
            <div className="skii-cards">
              {shelf.map((a) => (
                <button key={a.id} type="button" className="skii-card">
                  <span className="skii-card-art" style={{ ['--card-accent' as string]: a.accent ?? '#38bdf8' }}>{a.glyph}</span>
                  <span className="skii-card-name">{a.name}</span>
                  <span className="skii-card-kind">{a.kind}</span>
                  {a.pinned && <span className="skii-card-pin">★ PINNED</span>}
                </button>
              ))}
            </div>
          </section>

          <section className="skii-shelf">
            <div className="skii-section-head">
              <h2>🎬 CINEMA, MUSIC &amp; ENTERTAINMENT</h2>
              <p>Installed streaming, local playback, and audio apps</p>
            </div>
            <div className="skii-cards">
              {ENTERTAINMENT.map((a) => (
                <button key={a.id} type="button" className="skii-card">
                  <span className="skii-card-art" style={{ ['--card-accent' as string]: a.accent ?? '#38bdf8' }}>{a.glyph}</span>
                  <span className="skii-card-name">{a.name}</span>
                  <span className="skii-card-kind">{a.kind}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {ambient && (
          <div className="skii-ambient">
            <div className="skii-ambient-corner">
              <div className="skii-ambient-clock">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="skii-ambient-date">
                {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </div>
              {playerOpen && (
                <div className="skii-ambient-player">
                  <span className="skii-ambient-eq"><i /><i /><i /></span>
                  <span>{track.title}</span>
                  <span className="skii-ambient-artist">{track.artist}</span>
                </div>
              )}
              <div className="skii-ambient-realm">{realm.title} · {realm.subtitle}</div>
            </div>
            <div className="skii-ambient-hint">
              <button type="button" onClick={() => setAmbient(false)}>Wake</button>
              <button type="button" onClick={nextRealm}>Next realm</button>
            </div>
          </div>
        )}

        <ControlDeck
          open={deckOpen}
          onToggle={() => setDeckOpen((d) => !d)}
          realm={realm}
          family={family}
          familyOverride={familyOverride}
          onFamily={(f) => setFamilyOverride(f)}
          particleMode={particleMode}
          onParticleMode={(m) => setParticleMode(m)}
          fogLevel={fogLevel}
          onFogLevel={(l) => setFogLevel(l)}
          onShuffle={shuffle}
          onAmbient={() => setAmbient((a) => !a)}
          ambient={ambient}
          realmCount={realms.length}
        />

        <ReturnToPortfolio projectName="Skii OS" />
      </div>
    </div>
  );
}
