import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/navigation';
import Footer from './components/footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SectorsPage from './pages/SectorsPage';
import SectorDetailPage from './pages/SectorDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AboutPage from './pages/AboutPage';
import InsightsPage from './pages/InsightsPage';
import ContactPage from './pages/ContactPage';
import { ReturnToPortfolio } from './components/ReturnToPortfolio';
import './styles/apex.css';

export const App: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="apex-root">
      {/* Return to Portfolio escape button */}
      <ReturnToPortfolio projectName="Apex Facilities Group" />

      {/* Apex Navigation */}
      <Navigation />

      {/* Sub-Routes */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="sectors" element={<SectorsPage />} />
          <Route path="sectors/:slug" element={<SectorDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Apex Footer */}
      <Footer />
    </div>
  );
};

export default App;
