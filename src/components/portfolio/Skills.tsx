import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const Skills: React.FC = () => {
  const technicalSkills = [
    'C# / ASP.NET MVC',
    'SQL',
    'Full-Stack Dev',
    'React Native',
    'Git',
    'Microsoft Office',
    'NLP Fundamentals',
    'CUDA Basics',
    'Docker',
    'WordPress'
  ];

  const languagesAndStrengths = [
    'English — C2',
    'Zulu — C2',
    'Mandarin — HSK1',
    'Public Speaking',
    'Customer Service',
    'Fast Learner',
    'Teamwork'
  ];

  return (
    <section id="skills">
      <div className={styles.twoCol}>
        <div>
          <div className={styles.sectionLabel}>Technical skills</div>
          <div className={styles.box} style={{ marginBottom: 0 }}>
            <div className={styles.skillList}>
              {technicalSkills.map((skill, index) => (
                <span key={index} className={styles.skillPill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className={styles.sectionLabel}>Languages &amp; strengths</div>
          <div className={styles.box} style={{ marginBottom: 0 }}>
            <div className={styles.skillList}>
              {languagesAndStrengths.map((strength, index) => (
                <span key={index} className={styles.skillPill}>{strength}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
