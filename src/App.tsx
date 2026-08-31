import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy-loaded standalone sub-apps to keep the initial portfolio bundle light and fast
const ApexApp = lazy(() => import('./projects/apex/ApexApp'));
const KasiCartApp = lazy(() => import('./projects/kasicart/KasiCartApp'));

// Scroll restoration component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top on non-hash navigation
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

// Loading fallback
const LoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading Project Experience...' }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(56, 189, 248, 0.2)',
      borderTopColor: '#38bdf8',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: '16px'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main Portfolio Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />

          {/* Isolated Standalone Project Sub-Apps */}
          <Route 
            path="/work/apex/*" 
            element={
              <Suspense fallback={<LoadingFallback label="Launching Apex Facilities Group..." />}>
                <ApexApp />
              </Suspense>
            } 
          />

          <Route 
            path="/work/kasicart/*" 
            element={
              <Suspense fallback={<LoadingFallback label="Launching KasiCart..." />}>
                <KasiCartApp />
              </Suspense>
            } 
          />

          {/* Reserved Slot Redirects */}
          <Route path="/work/carepoint" element={<WorkPage />} />
          <Route path="/work/project-four" element={<WorkPage />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
