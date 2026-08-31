import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WorkPage } from './pages/WorkPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll restoration component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Portfolio Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/carepoint" element={<WorkPage />} />
        <Route path="/work/project-four" element={<WorkPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
