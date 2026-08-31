import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectRegistryItem } from '../../types/project';
import { getAppUrl } from '../../config/projects';
import styles from '../../styles/work.module.css';

interface ProjectCardProps {
  project: ProjectRegistryItem;
  onSelectComingSoon?: (project: ProjectRegistryItem) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectComingSoon }) => {
  const isLive = project.status === 'live';

  return (
    <div className={styles.card}>
      {project.previewImage && (
        <div className={styles.imageWrapper}>
          <img 
            src={project.previewImage} 
            alt={`${project.title} preview`} 
            className={styles.previewImg} 
            loading="lazy"
          />
          <div className={styles.statusOverlay}>
            {isLive ? (
              <span className={styles.badgeLive}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                Live Application
              </span>
            ) : (
              <span className={styles.badgeComingSoon}>
                Coming Soon
              </span>
            )}
          </div>
        </div>
      )}

      <div className={styles.cardBody}>
        <div className={styles.categoryTag}>{project.category}</div>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardSummary}>{project.summary}</p>

        {/* Honest Disclosure Box */}
        <div className={styles.disclosureNotice}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>✦</span>
          <span>{project.honestDisclosure}</span>
        </div>

        {/* Capabilities */}
        <div className={styles.capabilitiesSection}>
          <div className={styles.capLabel}>Key Capabilities</div>
          <div className={styles.capPills}>
            {project.capabilities.map((cap, i) => (
              <span key={i} className={styles.capPill}>{cap}</span>
            ))}
          </div>
        </div>

        {/* Card Footer */}
        <div className={styles.cardFooter}>
          {isLive ? (
            <a href={getAppUrl(project.path)} className={styles.btnLaunch}>
              <span>Launch Experience</span>
              <span>→</span>
            </a>
          ) : (
            <button 
              type="button" 
              onClick={() => onSelectComingSoon && onSelectComingSoon(project)}
              className={`${styles.btnLaunch} ${styles.btnDisabled}`}
            >
              <span>Development Brief</span>
              <span>↗</span>
            </button>
          )}

          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.btnGhost}
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
