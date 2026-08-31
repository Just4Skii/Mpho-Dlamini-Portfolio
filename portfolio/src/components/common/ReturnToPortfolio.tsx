import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ReturnToPortfolioProps {
  projectName?: string;
}

export const ReturnToPortfolio: React.FC<ReturnToPortfolioProps> = ({ projectName }) => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/work');
  };

  return (
    <aside
      aria-label="GraffGrid Portfolio navigation"
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '9999px',
        padding: '6px 14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        fontSize: '0.8rem',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <button
        onClick={handleReturn}
        type="button"
        style={{
          background: 'none',
          border: 'none',
          color: '#38bdf8',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: 0,
          fontSize: '0.8rem'
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
        <span>GraffGrid</span>
      </button>

      {projectName && (
        <>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {projectName}
          </span>
        </>
      )}
    </aside>
  );
};
