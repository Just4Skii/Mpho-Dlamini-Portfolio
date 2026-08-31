import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Certifications: React.FC = () => {
  const certifications = [
    { brand: 'IBM', title: 'NLP & Computer Vision, Apr 2026' },
    { brand: 'IBM', title: 'Introduction to AI, Apr 2026' },
    { brand: 'NVIDIA', title: 'Introduction to CUDA, Apr 2026' },
    { brand: 'NVIDIA', title: 'Multi-Modal Data Curation, Apr 2026' },
    { brand: 'FNB', title: 'App Academy Full-Stack, 2025' },
    { brand: 'AWS', title: 'Academic Partner' },
    { brand: 'LinkedIn', title: 'Programming Foundations, 2025' },
    { brand: 'LinkedIn', title: 'Retail Sales, WordPress, Docker, 2025' },
    { brand: 'IT Varsity', title: 'Game Dev Boot Camp, 2021' },
  ];

  return (
    <section id="certifications">
      <div className={styles.sectionLabel}>Certifications &amp; courses</div>
      <div className={styles.box}>
        <div className={styles.certList}>
          {certifications.map((cert, index) => (
            <div key={index} className={styles.certBadge}>
              <span className={styles.certBrand}>{cert.brand}</span>
              <span>{cert.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
