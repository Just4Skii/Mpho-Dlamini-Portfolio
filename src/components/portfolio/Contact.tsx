import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Contact: React.FC = () => {
  return (
    <section id="contact">
      <div className={styles.sectionLabel}>Contact</div>
      <div className={`${styles.box} ${styles.contactBox}`}>
        <div>
          <div className={styles.contactInfoTitle}>Open to new projects &amp; opportunities</div>
          <div className={styles.contactInfoDetails}>
            Durban, KwaZulu-Natal &nbsp;·&nbsp; 067 602 9081 &nbsp;·&nbsp; Mphojunior6@gmail.com
          </div>
        </div>
        <div className={styles.actions}>
          <a 
            href="mailto:Mphojunior6@gmail.com" 
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Email me
          </a>
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
    </section>
  );
};
