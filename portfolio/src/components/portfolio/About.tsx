import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const About: React.FC = () => {
  return (
    <section id="about">
      <div className={styles.sectionLabel}>About</div>
      <div className={styles.box}>
        <p>
          I am a freelance software developer based in Durban, KwaZulu-Natal, working with clients on
          business systems, database-driven applications, and practical web tools built in C#, ASP.NET MVC,
          and SQL. I have completed my final exams in ICT Application Development at DUT and am awaiting
          formal graduation in 2027. I am an Amazon Bursary recipient and AWS Academic Partner, with
          certifications from IBM and NVIDIA covering AI, NLP, and GPU computing. Outside of tech, I have a
          background in customer-facing roles across promotions, sales, and hospitality, which means I
          communicate well, work under pressure, and understand what clients actually need. I am available
          for freelance projects, contract work, and junior software development roles.
        </p>
      </div>
    </section>
  );
};
