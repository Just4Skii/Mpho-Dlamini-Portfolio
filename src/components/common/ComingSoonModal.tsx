import React from 'react';
import { ProjectRegistryItem } from '../../types/project';

interface ComingSoonModalProps {
  project: ProjectRegistryItem | null;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#0f172a',
            border: '1px solid #334155',
            color: '#94a3b8',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fbbf24',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '3px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase'
          }}>
            Under Active Development
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reserved Route: {project.path}</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
          {project.title}
        </h3>
        <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, marginBottom: '16px' }}>
          {project.category}
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
          {project.summary}
        </p>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed #334155',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', marginBottom: '4px' }}>
            Concept Positioning &amp; Disclosure
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {project.honestDisclosure}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Planned Capabilities
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {project.capabilities.map((cap, i) => (
              <span key={i} style={{
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {cap}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: '#334155',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
