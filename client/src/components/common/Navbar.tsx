import React from 'react';
import { MessageSquarePlus, BarChart3, Activity, Sun, Moon, ShieldCheck, LogOut } from 'lucide-react';
import { AdminUser } from '../../types/index.js';

interface NavbarProps {
  activeTab: 'form' | 'dashboard';
  setActiveTab: (tab: 'form' | 'dashboard') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  user,
  onOpenLogin,
  onLogout,
  onOpenHealth,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-navbar)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.8rem 0',
      marginBottom: '2rem',
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 0,
        paddingBottom: 0,
        margin: '0 auto',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('form')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            A
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Acowale <span style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pulse</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CRM Machine Test
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'form' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'form' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <MessageSquarePlus size={18} />
            <span>Public Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'dashboard' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <BarChart3 size={18} />
            <span>Trend Dashboard</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Health Telemetry Button */}
          <button
            onClick={onOpenHealth}
            title="View System Observability & Health Telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Activity size={16} />
            <span>Live Health</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Admin Auth Status */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                <ShieldCheck size={16} />
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log out of Admin Console"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <ShieldCheck size={16} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
