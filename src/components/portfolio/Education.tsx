import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Education: React.FC = () => {
  const educations = [
    {
      title: 'Diploma in ICT: Software Development',
      institution: 'Durban University of Technology',
      date: 'Expected Dec 2026'
    },
    {
      title: 'Certificate in Computer Programming',
      institution: 'FNB App Academy: Full-Stack (32 credits)',
      date: 'Oct 2025'
    },
    {
      title: "National Senior Certificate, Bachelor's Pass",
      institution: 'Kloof High School',
      date: 'Dec 2023'
    }
  ];

  return (
    <section id="education">
      <div className={styles.sectionLabel}>Education</div>
      <div className={styles.box}>
        {educations.map((edu, index) => (
          <div key={index} className={styles.expItem}>
            <div className={styles.expHeader}>
              <div>
                <div className={styles.expTitle}>{edu.title}</div>
                <div className={styles.expCompany}>{edu.institution}</div>
              </div>
              <div className={styles.expDate}>{edu.date}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
