import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/portfolio.module.css';
import { getFeaturedProjects } from '../../config/projects';

export const FeaturedProjects: React.FC = () => {
  const platformProjects = getFeaturedProjects();

  const originalProjects = [
    {
      title: 'CiCi Panda',
      badge: '🏆 Top 20 in Africa',
      description: "AI-powered virtual Mandarin teaching assistant combining robotics simulation, expressive gesture control, and interactive lesson sequencing. Recognised as a Top 20 Finalist in the Africa Division of the China International College Students' Innovation Competition 2026.",
      tags: ['Python', 'AI', 'Robotics', 'EdTech'],
      highlight: true
    },
    {
      title: 'Digital Payroll System',
      description: 'Employee management system with payroll processing, role-based authentication, and admin dashboard built in ASP.NET MVC and SQL Server.',
      tags: ['C#', 'ASP.NET MVC', 'SQL Server'],
      highlight: false
    },
    {
      title: 'RePurpose',
      description: 'Hackathon project: a community-driven waste exchange platform that connects donors and recipients for responsible recycling.',
      tags: ['Hackathon', 'Web', 'Full-Stack'],
      highlight: false
    }
  ];

  return (
    <section id="projects">
      {/* PLATFORM PROJECTS BANNER */}
      <div className={styles.platformBanner}>
        <div className={styles.platformBannerHeader}>
          <div>
            <div className={styles.sectionLabel} style={{ marginBottom: '6px', color: '#38bdf8' }}>
              ✦ Interactive Project Platform
            </div>
            <h2 className={styles.platformBannerTitle}>Engineered Web &amp; Product Experiences</h2>
            <p className={styles.platformBannerText}>
              Explore independently developed frontend applications running live on the GraffGrid platform — including commercial architectures, e-commerce stores, and healthcare platforms.
            </p>
          </div>
          <Link to="/work" className={`${styles.btn} ${styles.btnPrimary}`}>
            Explore All Projects ({platformProjects.length}) →
          </Link>
        </div>

        {/* Mini project preview chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '8px' }}>
          {platformProjects.map((p) => {
            const isLive = p.status === 'live';
            const cardContent = (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {p.category.replace(' Experience', '')}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isLive ? '#34d399' : '#fbbf24',
                    border: `1px solid ${isLive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {isLive ? '● Live Project' : 'Coming Soon'}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {p.capabilities.slice(0, 3).join(' · ')}
                </div>
              </>
            );

            const cardStyle = {
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: '10px',
              padding: '14px',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease'
            };

            return isLive ? (
              <a key={p.id} href={p.path} style={cardStyle}>
                {cardContent}
              </a>
            ) : (
              <Link key={p.id} to="/work" style={cardStyle}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* CORE / ACADEMIC PROJECTS */}
      <div className={styles.sectionLabel}>Academic &amp; Hackathon Projects</div>
      <div className={styles.grid3}>
        {originalProjects.map((project, index) => (
          <div 
            key={index} 
            className={styles.projectCard}
            style={project.highlight ? { borderColor: '#38bdf8' } : undefined}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>{project.title}</h3>
                {project.badge && (
                  <span style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {project.badge}
                  </span>
                )}
              </div>
              <p>{project.description}</p>
            </div>
            <div className={styles.projectFooter}>
              <div className={styles.tags}>
                {project.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
