import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/portfolio/Navigation';
import { Footer } from '../components/portfolio/Footer';
import { ProjectCard } from '../components/work/ProjectCard';
import { ComingSoonModal } from '../components/common/ComingSoonModal';
import { getPublicProjects } from '../config/projects';
import { ProjectRegistryItem } from '../types/project';
import styles from '../styles/work.module.css';

export const WorkPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedComingSoon, setSelectedComingSoon] = useState<ProjectRegistryItem | null>(null);

  const commercialProjects = getPublicProjects();

  const softwareProjects = [
    {
      title: 'CiCi Panda — Virtual Mandarin Teaching Assistant',
      badge: '🏆 Top 20 in Africa',
      awardInfo: "China International College Students' Innovation Competition 2026",
      description: 'AI-powered virtual Mandarin teaching assistant combining robotics simulation, expressive gesture control, and interactive lesson sequencing.',
      stack: ['Python', 'AI / NLP', 'Robotics Simulation', 'EdTech'],
      type: 'AI / Robotics Innovation'
    },
    {
      title: 'Digital Payroll & Employee Management System',
      description: 'Full-stack employee management and payroll processing system featuring role-based authentication, tax tier calculations, payslip generation, and admin auditing.',
      stack: ['C#', 'ASP.NET MVC', 'SQL Server', 'Entity Framework'],
      type: 'Enterprise Backend System'
    },
    {
      title: 'RePurpose — Community Waste Exchange',
      description: 'Hackathon platform connecting local material donors and recycling recipients for community-driven ecological and material upcycling.',
      stack: ['Full-Stack Web', 'REST APIs', 'Relational DB'],
      type: 'Community Hackathon Project'
    }
  ];

  const filteredCommercial = commercialProjects.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'commercial') return p.category === 'Commercial Web Experience';
    if (activeFilter === 'commerce') return p.category === 'Commerce Experience';
    if (activeFilter === 'healthcare') return p.category === 'Healthcare Experience';
    return true;
  });

  const showSoftware = activeFilter === 'all' || activeFilter === 'software';
  const showCommercial = activeFilter !== 'software';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
      <Navigation />

      <main className={styles.workContainer}>
        <div className={styles.workHeader}>
          <Link to="/" className={styles.backLink}>
            ← Back to Overview
          </Link>
          <h1 className={styles.workTitle}>Selected Work &amp; Products</h1>
          <p className={styles.workSubtitle}>
            I design and build digital products, commercial architectures, and full-stack software systems.
            Explore interactive frontend applications running live on the GraffGrid platform.
          </p>

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Projects
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeFilter === 'commercial' ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter('commercial')}
            >
              Commercial Web
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeFilter === 'commerce' ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter('commerce')}
            >
              E-Commerce
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeFilter === 'healthcare' ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter('healthcare')}
            >
              Healthcare
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeFilter === 'software' ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter('software')}
            >
              Software Systems
            </button>
          </div>
        </div>

        {/* SECTION 1: SELECTED COMMERCIAL EXPERIENCES */}
        {showCommercial && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Selected Commercial &amp; Product Experiences</h2>
              <p className={styles.sectionSubtitle}>
                Independent frontend applications engineered from scratch. Click to launch the live product experience.
              </p>
            </div>

            <div className={styles.commercialGrid}>
              {filteredCommercial.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelectComingSoon={(p) => setSelectedComingSoon(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: SOFTWARE & SYSTEMS PROJECTS */}
        {showSoftware && (
          <section style={{ marginTop: showCommercial ? '16px' : '0' }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Software &amp; Systems Projects</h2>
              <p className={styles.sectionSubtitle}>
                Full-stack systems, AI integrations, and hackathon software implementations.
              </p>
            </div>

            <div className={styles.softwareGrid}>
              {softwareProjects.map((proj, idx) => (
                <div key={idx} className={styles.softwareCard}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
                        {proj.type}
                      </span>
                      {proj.badge && (
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px'
                        }}>
                          {proj.badge}
                        </span>
                      )}
                    </div>
                    <h4>{proj.title}</h4>
                    <p>{proj.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                    {proj.stack.map((st, sIdx) => (
                      <span key={sIdx} className={styles.capPill} style={{ fontSize: '0.7rem' }}>
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* COMING SOON MODAL */}
      <ComingSoonModal
        project={selectedComingSoon}
        onClose={() => setSelectedComingSoon(null)}
      />
    </div>
  );
};
