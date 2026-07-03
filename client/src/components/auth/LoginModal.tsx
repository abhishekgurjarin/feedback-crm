import React, { useState } from 'react';
import { Shield, Lock, Mail, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { AdminUser } from '../../types/index.js';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: AdminUser) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();

      if (data.success) {
        addToast('success', `Welcome back, ${data.data.user.name}!`);
        onSuccess(data.data.token, data.data.user);
        onClose();
      } else {
        addToast('error', data.error?.message || 'Login failed.');
      }
    } catch {
      addToast('error', 'Network error. Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@acowale.com');
    setPassword('AcowaleDemo2026');
    handleLogin('admin@acowale.com', 'AcowaleDemo2026');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Console Login">
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
        }}>
          <Shield size={28} />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Sign in to analyze customer sentiment trends, manage status workflows, and collaborate with #TeamAcowale.
        </p>
      </div>

      {/* 1-Click Demo Login Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid var(--border-hover)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>1-Click Evaluation Mode</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instant access with pre-seeded demo admin</span>
          </div>
        </div>
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Logging in...' : 'Demo Login'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or sign in manually</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acowale.com"
              required
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
        >
          {loading ? 'Verifying Credentials...' : 'Sign In'}
        </button>
      </form>
    </Modal>
  );
};
