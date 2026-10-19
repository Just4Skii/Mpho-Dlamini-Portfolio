import { useEffect, useState } from 'react';
import App from './App';
import CaseStudy from './pages/CaseStudy';
import ReturnToPortfolio from './components/ReturnToPortfolio';

// Platform shell around the embedded Klarrow workbench:
//  - GraffGrid return pill (top-left, fixed)
//  - "About" toggle that opens the full case study as an overlay
function AppShell() {
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAboutOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aboutOpen]);

  return (
    <>
      <ReturnToPortfolio onAbout={() => setAboutOpen(true)} />
      <App />
      {aboutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Klarrow case study"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            overflowY: 'auto',
            background: '#0b0a12',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <button
            type="button"
            aria-label="Close case study"
            onClick={() => setAboutOpen(false)}
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 9999,
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              background: 'rgba(11, 10, 18, 0.92)',
              color: '#a78bfa',
              fontSize: '1.1rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
          <CaseStudy />
        </div>
      )}
    </>
  );
}

export default AppShell;
