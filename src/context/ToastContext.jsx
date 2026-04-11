import { createContext, useContext, useState, useCallback } from 'react';

// ToastContext lets any component trigger a toast without prop-drilling.
// Usage: const { showToast } = useToast();  showToast("Done!");
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, msg: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: '' }), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render the single shared toast UI here so it's always available */}
      <div className={`toast-custom${toast.visible ? ' show' : ''}`}>
        <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>
          <i className="fas fa-check-circle" />
        </span>
        <span>{toast.msg}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
