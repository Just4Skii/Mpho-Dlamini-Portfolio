import React from 'react';
import styles from '../../styles/portfolio.module.css';

type ExperienceItem = {
  title: string;
  company: string;
  date: string;
  bullets: string[];
  certificate?: {
    label: string;
    href: string;
  };
};

export const Experience: React.FC = () => {
  const experiences: ExperienceItem[] = [
    {
      title: 'Herald — Social Gaming Support Contractor',
      company: 'Lightmare Studios Pty Ltd · Remote',
      date: 'Jul 2026 · Sep 2026',
      bullets: [
        'Provided player and community support for a live social gaming product as the studio’s Herald.',
        'Worked fully remote under an Independent Contractor Agreement, managing my own schedule and deliverables.',
        'Liaised directly with the studio team on player queries and feedback, keeping communication clear and timely.'
      ],
      certificate: {
        label: 'View certificate of service',
        href: '/lightmare-studios-certificate-of-service.pdf'
      }
    },
    {
      title: 'Field Promoter',
      company: 'Triple 8 / Connexit Promotions, Durban',
      date: 'Nov 2024 · May 2026',
      bullets: [
        'Set up promotional booths and created engaging displays to attract customers.',
        'Ran live product demos and activations, developing public speaking confidence.',
        'Coordinated campaign logistics and consistently met sales targets.',
        'Built customer relationships to support brand awareness and loyalty.'
      ]
    },
    {
      title: 'Barista',
      company: 'Xpresso, Durban',
      date: 'Jan 2024 · Aug 2024',
      bullets: [
        'Prepared beverages and maintained workspace standards during busy service periods.',
        'Handled transactions and delivered friendly, efficient customer service.'
      ]
    },
    {
      title: 'Independent Sales Agent',
      company: 'Credico Financial Services, Durban',
      date: 'Dec 2023 · Jan 2024',
      bullets: [
        'Advised customers on financial products through direct marketing.',
        'Processed sensitive customer data accurately and securely.'
      ]
    },
    {
      title: 'Shop Cashier',
      company: 'Kloof High School, Durban',
      date: 'Jan 2023 · Dec 2023',
      bullets: [
        'Operated POS system, managed stock takes, orders, and deliveries.',
        'Delivered consistent customer service over 12 months.'
      ]
    }
  ];

  return (
    <section id="experience">
      <div className={styles.sectionLabel}>Work experience</div>
      <div className={styles.box}>
        {experiences.map((exp, index) => (
          <div key={index} className={styles.expItem}>
            <div className={styles.expHeader}>
              <div>
                <div className={styles.expTitle}>{exp.title}</div>
                <div className={styles.expCompany}>{exp.company}</div>
              </div>
              <div className={styles.expDate}>{exp.date}</div>
            </div>
            <ul>
              {exp.bullets.map((bullet, bIndex) => (
                <li key={bIndex}>{bullet}</li>
              ))}
            </ul>
            {exp.certificate && (
              <a
                href={exp.certificate.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.certLink}
                title={`${exp.certificate.label} (opens the PDF in a new tab)`}
              >
                <span className={styles.certIcon} aria-hidden="true">📄</span>
                {exp.certificate.label}
                <span className={styles.certArrow} aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
