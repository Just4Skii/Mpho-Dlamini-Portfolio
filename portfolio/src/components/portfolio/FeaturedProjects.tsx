import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/portfolio.module.css';
import { getFeaturedProjects, getAppUrl } from '../../config/projects';

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
            <div className={styles.sectionLabel} style={{ marginBottom: '6px' }}>
              ✦ Interactive Project Platform
            </div>
            <h2 className={styles.platformBannerTitle}>Engineered Web &amp; Product Experiences</h2>
            <p className={styles.platformBannerText}>
              Explore independently developed applications running live on · or alongside · the GraffGrid platform · including commercial architectures, e-commerce stores, healthcare platforms, and native mobile utilities.
            </p>
          </div>
          <Link to="/work" className={`${styles.btn} ${styles.btnPrimary}`}>
            Explore All Projects ({platformProjects.length}) →
          </Link>
        </div>

        {/* Mini project preview chips */}
        <div className={styles.chipGrid}>
          {platformProjects.map((p) => {
            const isLive = p.status === 'live';
            const cardContent = (
              <>
                <div className={styles.chipTop}>
                  <span className={styles.chipCat}>
                    {p.category.replace(' Experience', '')}
                  </span>
                  <span className={`${styles.chipStatus} ${isLive ? styles.chipLive : styles.chipSoon}`}>
                    {isLive ? '● Live Project' : 'Coming Soon'}
                  </span>
                </div>
                <div className={styles.chipTitle}>
                  {p.title}
                </div>
                <div className={styles.chipCaps}>
                  {p.capabilities.slice(0, 3).join(' · ')}
                </div>
              </>
            );

            return isLive ? (
              <a
                key={p.id}
                href={p.externalUrl ?? getAppUrl(p.path)}
                {...(p.externalUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={styles.chip}
              >
                {cardContent}
              </a>
            ) : (
              <Link key={p.id} to="/work" className={styles.chip}>
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
            className={`${styles.projectCard} ${project.highlight ? styles.projectCardHighlight : ''}`}
          >
            <div>
              <div className={styles.projectTitleRow}>
                <h3>{project.title}</h3>
                {project.badge && (
                  <span className={styles.projectBadge}>
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
