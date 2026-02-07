'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ──────── Toast (simple accessible implementation) ────────
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 end-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in-0 duration-300 motion-reduce:animate-none',
              {
                'border-emerald-200/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/95 dark:text-emerald-200':
                  toast.type === 'success',
                'border-red-200/80 bg-red-50/95 text-red-800 dark:border-red-800/60 dark:bg-red-950/95 dark:text-red-200':
                  toast.type === 'error',
                'border-blue-200/80 bg-blue-50/95 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/95 dark:text-blue-200':
                  toast.type === 'info',
              }
            )}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ms-2 rounded p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
