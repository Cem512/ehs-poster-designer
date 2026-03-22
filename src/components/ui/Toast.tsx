import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type?: ToastType) => void) | null = null;

/** Show a toast notification from anywhere in the app */
export function showToast(message: string, type: ToastType = 'info') {
  addToastFn?.(message, type);
}

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: '#007A3320', border: '#007A3340', icon: '#007A33' },
  warning: { bg: '#F59E0B20', border: '#F59E0B40', icon: '#F59E0B' },
  info: { bg: '#003DA520', border: '#003DA540', icon: '#003DA5' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // keep max 5
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Register the global function
  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        const colors = COLORS[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-sm animate-in fade-in slide-in-from-bottom-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: `1px solid ${colors.border}`,
              minWidth: 200,
              maxWidth: 400,
            }}
          >
            <Icon size={16} style={{ color: colors.icon }} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="w-5 h-5 flex items-center justify-center rounded shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
