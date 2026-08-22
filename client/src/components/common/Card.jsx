import React from 'react';

export const Card = ({ children, className = '', elevated = true, ...props }) => {
  return (
    <div
      className={`${
        elevated ? 'light-card-elevated' : 'light-card'
      } rounded-2xl p-6 sm:p-8 transition-all text-slate-800 bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
