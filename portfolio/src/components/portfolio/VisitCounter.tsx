import React from 'react';
import { useUniqueVisitorCount } from '../../hooks/useUniqueVisitorCount';
import styles from '../../styles/portfolio.module.css';

/**
 * Labelled unique-visitor total. Outputs nothing until a value is known, so the
 * footer never shows a placeholder, a zero, or an error state.
 */
export const VisitCounter: React.FC = () => {
  const count = useUniqueVisitorCount();

  if (count === null) return null;

  return (
    <span className={styles.visitCount}>
      <span className={styles.visitLabel}>Unique visitors</span>
      <span className={styles.visitValue}>{count.toLocaleString('en-ZA')}</span>
    </span>
  );
};
