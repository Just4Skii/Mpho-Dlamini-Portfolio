import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReturnToPortfolio } from './components/ReturnToPortfolio';
import { Landing } from './pages/Landing';

export const App: React.FC = () => {
  return (
    <div>
      <ReturnToPortfolio projectName="StickerBridge" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </div>
  );
};

export default App;
