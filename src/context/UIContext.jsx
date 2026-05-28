import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDanger: false,
    resolve: null
  });

  // --- TOAST NOTIFICATIONS ---
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- PROMISE-BASED CONFIRM DIALOG ---
  const showConfirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        isOpen: true,
        title: options.title || 'Confirmar Ação',
        message: message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        isDanger: options.isDanger || message.toLowerCase().includes('excluir') || message.toLowerCase().includes('remover') || message.toLowerCase().includes('apagar'),
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmConfig.resolve) {
      confirmConfig.resolve(true);
    }
    setConfirmConfig((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    if (confirmConfig.resolve) {
      confirmConfig.resolve(false);
    }
    setConfirmConfig((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  // --- INLINE alert() COMPATIBILITY HELPER ---
  const showAlert = useCallback((message, title = 'Aviso') => {
    return showConfirm(message, {
      title,
      confirmText: 'Entendido',
      cancelText: '',
      isDanger: false
    });
  }, [showConfirm]);

  const value = {
    showToast,
    showConfirm,
    showAlert
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      
      {/* --- TOASTS CONTAINER --- */}
      <div style={toastsContainerStyle}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ ...toastStyle, ...getToastTypeStyle(toast.type) }} className="toast-item">
            <span style={{ fontSize: '16px' }}>{getToastIcon(toast.type)}</span>
            <span style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={toastCloseBtnStyle}>✕</button>
          </div>
        ))}
      </div>

      {/* --- CONFIRM DIALOG OVERLAY --- */}
      {confirmConfig.isOpen && (
        <div style={overlayStyle} onClick={handleCancel}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{confirmConfig.isDanger ? '⚠️' : '❓'}</span>
                {confirmConfig.title}
              </h3>
              {confirmConfig.cancelText && (
                <button onClick={handleCancel} style={closeBtnStyle}>✕</button>
              )}
            </div>
            <div style={modalBodyStyle}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {confirmConfig.message}
              </p>
            </div>
            <div style={modalFooterStyle}>
              {confirmConfig.cancelText && (
                <button onClick={handleCancel} style={btnCancelStyle}>
                  {confirmConfig.cancelText}
                </button>
              )}
              <button 
                onClick={handleConfirm} 
                style={confirmConfig.isDanger ? btnDangerStyle : btnConfirmStyle}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI deve ser usado dentro de um UIProvider');
  }
  return context;
}

// --- CSS STYLES FOR TOASTS AND CONFIRM MODAL ---
const toastsContainerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 99999,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '380px',
  width: 'calc(100% - 40px)'
};

const toastStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: '1px solid',
  backdropFilter: 'blur(10px)',
  animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  color: '#ffffff'
};

const toastCloseBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.6)',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '4px',
  marginLeft: '10px',
  transition: 'color 0.2s'
};

function getToastIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '🔔';
  }
}

function getToastTypeStyle(type) {
  switch (type) {
    case 'success':
      return {
        backgroundColor: 'rgba(16, 185, 129, 0.95)', // emerald
        borderColor: '#10b981'
      };
    case 'error':
      return {
        backgroundColor: 'rgba(239, 68, 68, 0.95)', // rose
        borderColor: '#ef4444'
      };
    case 'warning':
      return {
        backgroundColor: 'rgba(245, 158, 11, 0.95)', // amber
        borderColor: '#f59e0b'
      };
    case 'info':
    default:
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.95)', // blue
        borderColor: '#3b82f6'
      };
  }
}

// --- MODAL STYLES ---
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 99998,
  animation: 'fadeIn 0.25s ease-out'
};

const modalContentStyle = {
  backgroundColor: 'var(--bg-card)',
  borderRadius: '16px',
  width: '95%',
  maxWidth: '440px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), var(--shadow-glow)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
};

const modalHeaderStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--border-light)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle = {
  border: 'none',
  background: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  padding: '4px'
};

const modalBodyStyle = {
  padding: '24px 20px',
  maxHeight: '60vh',
  overflowY: 'auto'
};

const modalFooterStyle = {
  padding: '16px 20px',
  borderTop: '1px solid var(--border-light)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px'
};

const btnCancelStyle = {
  padding: '10px 18px',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border-light)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  transition: 'all 0.2s'
};

const btnConfirmStyle = {
  padding: '10px 18px',
  backgroundColor: 'var(--brand)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  boxShadow: '0 4px 12px rgba(0, 208, 132, 0.2)',
  transition: 'all 0.2s'
};

const btnDangerStyle = {
  padding: '10px 18px',
  backgroundColor: 'var(--danger)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
  transition: 'all 0.2s'
};
