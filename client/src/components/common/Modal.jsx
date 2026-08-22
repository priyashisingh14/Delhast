import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'warning',
  confirmText = 'Understood',
  onConfirm,
  cancelText,
  onCancel,
  showCloseButton = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    error: <ShieldAlert className="w-6 h-6 text-rose-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    info: <Info className="w-6 h-6 text-brand-600" />
  };

  const badgeBorders = {
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-rose-200 bg-rose-50',
    success: 'border-emerald-200 bg-emerald-50',
    info: 'border-brand-200 bg-brand-50'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 z-10 overflow-hidden"
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl border ${badgeBorders[type]} shrink-0`}>
                {icons[type]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
                <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {children}
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-7 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
              {cancelText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel || onClose}
                  className="w-full sm:w-auto font-medium"
                >
                  {cancelText}
                </Button>
              )}
              {confirmText && (
                <Button
                  variant={type === 'error' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={onConfirm || onClose}
                  className="w-full sm:w-auto font-medium"
                >
                  {confirmText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
