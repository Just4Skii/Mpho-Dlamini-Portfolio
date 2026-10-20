import React from 'react';

function getPortfolioReturnUrl(): string {
  if (typeof window === 'undefined') return '/work';
  const pathname = window.location.pathname;
  const match = pathname.match(/^(\/[^\/]+)\/work/i);
  if (match && match[1]) {
    return `${match[1]}/work`;
  }
  return '/work';
}

interface ReturnToPortfolioProps {
  projectName?: string;
}

export const ReturnToPortfolio: React.FC<ReturnToPortfolioProps> = ({ projectName = 'Skii OS' }) => {
  return (
    <aside
      aria-label="GraffGrid Portfolio navigation"
      className="skii-return"
    >
      <a href={getPortfolioReturnUrl()}>
        <span aria-hidden="true">←</span>
        <span>GraffGrid</span>
      </a>
      <span className="skii-return-sep">|</span>
      <span className="skii-return-name">{projectName}</span>
    </aside>
  );
};

export default ReturnToPortfolio;
