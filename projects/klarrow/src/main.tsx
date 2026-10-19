import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/ibm-plex-mono';
import './App.css';
import AppShell from './AppShell';

// The Klarrow workbench (canonical source: Just4Skii/Klarrow src/frontend) embedded in the
// GraffGrid platform shell. No react-router: the platform 404 handler restores deep links
// and any path under /work/klarrow/* renders this single-page workbench as-is.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>
);
