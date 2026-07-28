import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, X, Sparkles } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'alert' | 'error';
}

export type ToastMessage = ToastItem;

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss?: (id: string) => void;
  onCloseToast?: (id: string) => void;
}

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    // Enforce strict 2-second display duration for all toast notifications
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />,
    alert: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  };

  const bgBorders = {
    success: 'bg-slate-900/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40 ring-1 ring-emerald-500/20',
    info: 'bg-slate-900/90 border-indigo-500/40 text-indigo-200 shadow-indigo-950/40 ring-1 ring-indigo-500/20',
    alert: 'bg-slate-900/90 border-amber-500/40 text-amber-200 shadow-amber-950/40 ring-1 ring-amber-500/20',
    error: 'bg-slate-900/90 border-rose-500/40 text-rose-200 shadow-rose-950/40 ring-1 ring-rose-500/20',
  };

  const barColors = {
    success: 'bg-emerald-500',
    info: 'bg-indigo-500',
    alert: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl ${bgBorders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 pr-1 min-w-0">
        <h4 className="text-xs font-heading font-extrabold text-white truncate">{toast.title}</h4>
        {toast.message && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-medium line-clamp-2">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
        title="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 2-second countdown progress bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 2, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-0.5 ${barColors[toast.type]}`}
      />
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onCloseToast }) => {
  const dismissHandler = onDismiss || onCloseToast || (() => {});
  if (toasts.length === 0) return null;

  const visibleToasts = toasts.slice(-3);

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
      <AnimatePresence mode="sync">
        {visibleToasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissHandler} />
        ))}
      </AnimatePresence>
    </div>
  );
};


