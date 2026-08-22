import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

const badgeVariants = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  academic: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const Badge = ({ children, variant = 'verified', icon = true, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
        badgeVariants[variant] || badgeVariants.neutral
      } ${className}`}
    >
      {icon && variant === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      {icon && variant === 'academic' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
      {icon && variant === 'warning' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
      {icon && variant === 'danger' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
      <span>{children}</span>
    </span>
  );
};
