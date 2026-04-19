'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeqRef = React.useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    toastSeqRef.current += 1;
    const id = `${Date.now()}-${toastSeqRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-500 text-emerald-800';
      case 'error': return 'bg-rose-50 border-rose-500 text-rose-800';
      case 'warning': return 'bg-amber-50 border-amber-500 text-amber-800';
      default: return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  const Icon = ({ type }: { type: ToastType }) => {
     switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
     }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg 
              animate-in slide-in-from-right duration-300 pointer-events-auto
              min-w-[300px] max-w-md ${getToastStyles(toast.type)}
            `}
          >
            <Icon type={toast.type} />
            <p className="flex-1 text-sm font-semibold leading-tight">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
