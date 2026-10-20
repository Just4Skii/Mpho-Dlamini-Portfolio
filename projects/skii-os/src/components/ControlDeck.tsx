import { FAMILIES, type AmbienceFamily } from '../engine/ambience';
import type { Realm } from '../engine/realms';

interface ControlDeckProps {
  open: boolean;
  onToggle: () => void;
  realm: Realm;
  family: AmbienceFamily;
  familyOverride: AmbienceFamily | 'auto';
  onFamily: (f: AmbienceFamily | 'auto') => void;
  particleMode: number;
  onParticleMode: (m: number) => void;
  fogLevel: number;
  onFogLevel: (l: number) => void;
  onShuffle: () => void;
  onAmbient: () => void;
  ambient: boolean;
  realmCount: number;
}

/**
 * The control deck - the piece of the environment that lets you actually drive
 * the launcher: change the ambience family, the particle mode, the fog, shuffle
 * the wallpapers or drop into the ambient screensaver.
 */
export function ControlDeck(props: ControlDeckProps) {
  const {
    open, onToggle, realm, family, familyOverride, onFamily,
    particleMode, onParticleMode, fogLevel, onFogLevel,
    onShuffle, onAmbient, ambient, realmCount,
  } = props;

  return (
    <>
      <button type="button" className={`skii-deck-toggle${open ? ' is-open' : ''}`} onClick={onToggle}>
        {open ? '×' : '⚙'} <span>Control deck</span>
      </button>

      {open && (
        <aside className="skii-deck" aria-label="Control deck">
          <header>
            <h3>Control deck</h3>
            <p>The same engine the television runs. Every change is live.</p>
          </header>

          <div className="skii-deck-readout">
            <div><span>REALM</span><strong>{realm.title}</strong></div>
            <div><span>SERIES</span><strong>{realm.series}</strong></div>
            <div><span>AMBIENCE</span><strong>{family}</strong></div>
            <div><span>REALMS</span><strong>{realmCount}</strong></div>
          </div>

          <label className="skii-deck-field">
            <span>Ambience family</span>
            <select
              value={familyOverride}
              onChange={(e) => onFamily(e.target.value as AmbienceFamily | 'auto')}
            >
              <option value="auto">auto — follow the artwork</option>
              {FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          <div className="skii-deck-field">
            <span>Particles</span>
            <div className="skii-deck-segmented">
              {['Off', 'Subtle', 'Dynamic'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={particleMode === i ? 'is-on' : ''}
                  onClick={() => onParticleMode(i)}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="skii-deck-field">
            <span>Fog</span>
            <div className="skii-deck-segmented">
              {['Off', 'Faint', 'Dense'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={fogLevel === i ? 'is-on' : ''}
                  onClick={() => onFogLevel(i)}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="skii-deck-actions">
            <button type="button" onClick={onShuffle}>⇄ Shuffle wallpapers</button>
            <button type="button" onClick={onAmbient}>
              {ambient ? 'Wake the screen' : '🌄 Ambient screensaver'}
            </button>
          </div>

          <footer>
            <p><kbd>←</kbd><kbd>→</kbd> switch realm · <kbd>space</kbd> play/pause · <kbd>N</kbd> next track · <kbd>A</kbd> ambient · <kbd>S</kbd> shuffle · <kbd>D</kbd> deck</p>
          </footer>
        </aside>
      )}
    </>
  );
}
