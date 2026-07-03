import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '2.5rem 0',
      marginTop: '4rem',
      background: 'rgba(0, 0, 0, 0.2)',
      fontSize: '0.875rem',
      color: 'var(--text-muted)',
    }}>
      <div className="app-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingBottom: 0,
      }}>
        <div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Acowale Pulse CRM &mdash; Engineered for high-velocity trend intelligence.
          </p>
          <span style={{ fontSize: '0.75rem' }}>
            Submitted for the Software Engineering Machine Test at Acowale Technologies Private Limited.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="https://www.acowale.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500 }}
          >
            <span>www.acowale.com</span>
            <ExternalLink size={14} />
          </a>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            Built with <Heart size={14} style={{ color: 'var(--color-danger)', fill: 'var(--color-danger)' }} /> by Abhishek
          </span>
        </div>
      </div>
    </footer>
  );
};
