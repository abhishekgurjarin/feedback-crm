import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ToastContainer } from './components/common/ToastContainer.js';
import { FeedbackForm } from './components/feedback/FeedbackForm.js';
import { AdminConsole } from './components/dashboard/AdminConsole.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { SystemStatusModal } from './components/observability/SystemStatusModal.js';
import { AdminUser, ToastMessage, FeedbackItem } from './types/index.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard'>('form');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  // Initialize theme and auth from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('acowale_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedToken = localStorage.getItem('acowale_token');
    const savedUser = localStorage.getItem('acowale_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('acowale_token');
        localStorage.removeItem('acowale_user');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('acowale_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('acowale_token', newToken);
    localStorage.setItem('acowale_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('acowale_token');
    localStorage.removeItem('acowale_user');
    addToast('info', 'You have logged out of the Admin Console.');
  };

  const handleFeedbackSubmitted = (_newFeedback: FeedbackItem) => {
    // Optionally switch tab or trigger celebratory toast
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
          onOpenHealth={() => setIsHealthOpen(true)}
        />

        <main className="app-container">
          {activeTab === 'form' ? (
            <FeedbackForm
              onSuccess={handleFeedbackSubmitted}
              addToast={addToast}
              onSwitchToDashboard={() => setActiveTab('dashboard')}
            />
          ) : (
            <AdminConsole
              user={user}
              token={token}
              onOpenLogin={() => setIsLoginOpen(true)}
              addToast={addToast}
            />
          )}
        </main>
      </div>

      <Footer />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        addToast={addToast}
      />

      <SystemStatusModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />
    </div>
  );
};
