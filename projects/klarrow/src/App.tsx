import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReturnToPortfolio } from './components/ReturnToPortfolio';
import { CaseStudy } from './pages/CaseStudy';

export const App: React.FC = () => {
  return (
    <div>
      <ReturnToPortfolio projectName="Klarrow" />
      <Routes>
        <Route path="/" element={<CaseStudy />} />
        <Route path="*" element={<CaseStudy />} />
      </Routes>
    </div>
  );
};

export default App;
