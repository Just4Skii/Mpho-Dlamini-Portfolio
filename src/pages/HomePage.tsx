import React from 'react';
import { Navigation } from '../components/portfolio/Navigation';
import { Hero } from '../components/portfolio/Hero';
import { FeaturedProjects } from '../components/portfolio/FeaturedProjects';
import { Services } from '../components/portfolio/Services';
import { About } from '../components/portfolio/About';
import { Skills } from '../components/portfolio/Skills';
import { Experience } from '../components/portfolio/Experience';
import { Education } from '../components/portfolio/Education';
import { Certifications } from '../components/portfolio/Certifications';
import { Contact } from '../components/portfolio/Contact';
import { Footer } from '../components/portfolio/Footer';
import styles from '../styles/portfolio.module.css';

export const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      <Navigation />
      <main className={styles.container}>
        <Hero />
        <FeaturedProjects />
        <Services />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};
