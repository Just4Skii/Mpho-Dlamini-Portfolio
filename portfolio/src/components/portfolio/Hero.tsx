import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/portfolio.module.css';

export const Hero: React.FC = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.heroBadges}>
        <span className={`${styles.badge} ${styles.badgeGreen}`}>
          <span className={styles.statusDot}></span> Available for Freelance Work
        </span>
        <span className={`${styles.badge} ${styles.badgeAmber}`}>
          🏆 Amazon Bursary Recipient
        </span>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>
          🎓 ICT &nbsp;·&nbsp; Graduating 2027
        </span>
      </div>

      <h1 className={styles.heroTitle}>Mpho Dlamini</h1>
      <div className={styles.heroSubtitle}>
        Freelance Software Developer
      </div>

      <p className={styles.heroBio}>
        I build practical software solutions that solve real-world problems. I&rsquo;m a software developer
        specializing in C#, ASP.NET MVC, SQL, and web application development, and I enjoy turning ideas into
        functional digital products &mdash; from business systems and database-driven applications to tools that
        address everyday challenges. I&rsquo;ve completed my final exams in ICT Application Development and am
        awaiting formal graduation in 2027. I&rsquo;m available for freelance projects, contract work, and junior
        software development opportunities.
      </p>

      <div className={styles.actions}>
        <Link to="/work" className={`${styles.btn} ${styles.btnPrimary}`}>
          View Selected Work ↗
        </Link>
        <a 
          href="https://github.com/Just4Skii" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          GitHub ↗
        </a>
        <a 
          href="https://tinyurl.com/Mpho-dlamini" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          LinkedIn ↗
        </a>
      </div>
    </div>
  );
};
