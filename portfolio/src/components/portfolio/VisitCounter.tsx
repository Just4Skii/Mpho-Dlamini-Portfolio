import React from 'react';
import { useUniqueVisitorCount } from '../../hooks/useUniqueVisitorCount';
import styles from '../../styles/portfolio.module.css';

/**
 * Renders the unique-visitor total as a bare number (no visible label).
 * Outputs nothing until a value is known, so the footer never shows a
 * placeholder, a zero, or an error state.
 */
export const VisitCounter: React.FC = () => {
  const count = useUniqueVisitorCount();

  if (count === null) return null;

  return (
    <span
      className={styles.visitCount}
      aria-label={`${count} unique visitors`}
      title={`${count} unique visitors`}
    >
      {count.toLocaleString('en-ZA')}
    </span>
  );
};
