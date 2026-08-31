import React from 'react';
import styles from '../../styles/portfolio.module.css';

export const About: React.FC = () => {
  return (
    <section id="about">
      <div className={styles.sectionLabel}>About</div>
      <div className={styles.box}>
        <p>
          I am an independent software developer and ICT professional based in Durban, KwaZulu-Natal,
          currently completing a Diploma in ICT: Software Development at DUT (expected December 2026).
          I am an Amazon Bursary recipient and AWS Academic Partner, with certifications from IBM and NVIDIA
          covering AI, NLP, and GPU computing. Outside of tech, I have a background in customer-facing roles
          across promotions, sales, and hospitality, which means I communicate well, work under pressure, and
          understand what clients actually need. I am available for freelance work, consulting, and junior dev roles.
        </p>
      </div>
    </section>
  );
};
