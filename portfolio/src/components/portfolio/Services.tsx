import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Services: React.FC = () => {
  const servicesList = [
    {
      icon: '💻',
      title: 'Full-Stack Development',
      description: 'Web application architecture, API integrations, and backend logic.',
      tags: ['C#', 'ASP.NET MVC', 'REST APIs', 'React']
    },
    {
      icon: '🗄️',
      title: 'Database Design & SQL',
      description: 'Relational database architecture, query writing, and performance tuning.',
      tags: ['SQL Server', 'Data Modelling', 'Optimization']
    },
    {
      icon: '🤖',
      title: 'Applied AI Tools',
      description: 'Integrating AI-assisted workflows and automation into software projects.',
      tags: ['NLP Basics', 'AI Workflows', 'IBM Certified']
    },
    {
      icon: '🛠️',
      title: 'IT Support & Ops',
      description: 'Technical troubleshooting, platform administration, and user support.',
      tags: ['Tech Support', 'Git', 'Microsoft Office']
    }
  ];

  return (
    <section id="services">
      <div className={styles.sectionLabel}>Services offered</div>
      <div className={styles.grid4}>
        {servicesList.map((service, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.cardIcon}>{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <div className={styles.tags}>
              {service.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
