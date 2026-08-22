import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helperText,
      icon: Icon,
      className = '',
      wrapperClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${wrapperClassName}`}>
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-slate-700 tracking-tight"
            >
              {label}
            </label>
          </div>
        )}
        <div className="relative rounded-xl transition-all duration-150">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={inputType}
            className={`w-full rounded-xl border bg-slate-50/60 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:bg-white focus:outline-none shadow-xs ${
              Icon ? 'pl-10' : 'pl-3.5'
            } ${isPassword ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 bg-rose-50/50 text-rose-900'
                : 'border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10'
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
