import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types/index.js';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
          ) : toast.type === 'error' ? (
            <AlertCircle size={20} style={{ color: 'var(--color-danger)' }} />
          ) : (
            <Info size={20} style={{ color: 'var(--color-cyan)' }} />
          );

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              {icon}
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
