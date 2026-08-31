import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../../styles/portfolio.module.css';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const scrollToSection = (sectionId: string) => {
    if (!isHomePage) {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.navBrand}>
        <span>Mpho Dlamini</span>
        <span className={styles.navBrandTag}>GraffGrid</span>
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/work" className={styles.navWorkLink}>
            Work & Projects ↗
          </Link>
        </li>
        <li><button type="button" onClick={() => scrollToSection('services')}>Services</button></li>
        <li><button type="button" onClick={() => scrollToSection('about')}>About</button></li>
        <li><button type="button" onClick={() => scrollToSection('skills')}>Skills</button></li>
        <li><button type="button" onClick={() => scrollToSection('experience')}>Experience</button></li>
        <li><button type="button" onClick={() => scrollToSection('contact')}>Contact</button></li>
      </ul>
    </nav>
  );
};
