import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="mailto:Mphojunior6@gmail.com">Email</a>
        <a href="https://github.com/Just4Skii" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://tinyurl.com/Mpho-dlamini" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
      <div className={styles.footerCopy}>
        © {new Date().getFullYear()} Mpho Dlamini · GraffGrid · All rights reserved
      </div>
    </footer>
  );
};
