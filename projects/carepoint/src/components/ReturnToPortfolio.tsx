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

export const ReturnToPortfolio: React.FC<ReturnToPortfolioProps> = ({ projectName = 'CarePoint' }) => {
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
        background: 'rgba(22, 33, 29, 0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(20, 88, 75, 0.5)',
        borderRadius: '9999px',
        padding: '6px 14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        fontSize: '0.8rem',
        color: '#fbfaf5',
        fontFamily: '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <a
        href={getPortfolioReturnUrl()}
        style={{
          background: 'none',
          border: 'none',
          color: '#c3d8cd',
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
          <span style={{ color: '#4c5b54' }}>|</span>
          <span style={{ color: '#e4ede7', fontSize: '0.75rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {projectName}
          </span>
        </>
      )}
    </aside>
  );
};

export default ReturnToPortfolio;
