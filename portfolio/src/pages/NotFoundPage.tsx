import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/portfolio/Navigation';
import { Footer } from '../components/portfolio/Footer';

export const NotFoundPage: React.FC = () => {
  return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      <Navigation />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '480px',
          background: 'var(--surface)',
          border: '1px solid var(--line-strong)',
          borderRadius: '16px',
          padding: '40px 32px'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>404</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            The requested route does not exist on the GraffGrid platform.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              Return Home
            </Link>
            <Link
              to="/work"
              style={{
                background: 'var(--line-strong)',
                color: 'var(--text)',
                border: '1px solid var(--line-strong)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View Work
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
