import React from 'react';

interface ReturnToPortfolioProps {
  projectName?: string;
}

function getPortfolioReturnUrl(): string {
  if (typeof window === 'undefined') return '/work';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(\/[^\/]+)\/work/i);
  if (match && match[1]) {
    return `${match[1]}/work`;
  }
  return '/work';
}

export const ReturnToPortfolio: React.FC<ReturnToPortfolioProps> = ({ projectName = 'Klarrow' }) => {
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
        background: 'rgba(11, 10, 18, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '9999px',
        padding: '6px 14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
        fontSize: '0.8rem',
        color: '#f5f3ff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <a
        href={getPortfolioReturnUrl()}
        style={{
          background: 'none',
          border: 'none',
          color: '#a78bfa',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: 0,
          fontSize: '0.8rem',
          textDecoration: 'none'
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
        <span>GraffGrid</span>
      </a>

      {projectName && (
        <>
          <span style={{ color: '#4c4560' }}>|</span>
          <span style={{ color: '#b6b0cc', fontSize: '0.75rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {projectName}
          </span>
        </>
      )}
    </aside>
  );
};

export default ReturnToPortfolio;
