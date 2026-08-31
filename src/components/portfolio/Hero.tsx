import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/portfolio.module.css';

export const Hero: React.FC = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.heroBadges}>
        <span className={`${styles.badge} ${styles.badgeGreen}`}>
          <span className={styles.statusDot}></span> Available for Contract Work
        </span>
        <span className={`${styles.badge} ${styles.badgeAmber}`}>
          🏆 Amazon Bursary Recipient
        </span>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>
          🎓 Final Year, DUT Software Development
        </span>
      </div>

      <h1 className={styles.heroTitle}>Mpho Dlamini</h1>
      <div className={styles.heroSubtitle}>
        Software Developer &nbsp;·&nbsp; Frontend &nbsp;·&nbsp; Full-Stack &nbsp;·&nbsp; Product Experiences
      </div>

      <p className={styles.heroBio}>
        Final year Software Development student at Durban University of Technology and Amazon Bursary recipient,
        with hands-on experience building full-stack applications in C# and ASP.NET MVC, designing relational databases,
        and engineering modern frontend product experiences with React and TypeScript.
        Open to freelance contracts, short-term project work, and developer roles.
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
