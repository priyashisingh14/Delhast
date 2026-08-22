import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm hover:shadow active:scale-[0.99] border border-indigo-700/50',
  secondary:
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 active:scale-[0.99]',
  outline:
    'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 active:scale-[0.99] shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-[0.99]',
  danger:
    'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm active:scale-[0.99] border border-rose-700/50',
  emerald:
    'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm active:scale-[0.99] border border-emerald-700/50',
  dark:
    'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-sm active:scale-[0.99] border border-slate-700'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-3 text-sm font-semibold rounded-xl gap-2.5'
};

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};
