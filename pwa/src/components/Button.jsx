import React from 'react';

const Button = ({
  onClick,
  children,
  variant = 'primary',
  className = '',
  size = 'md',
  disabled = false
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 touch-manipulation';

  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200',
    warning: 'bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-amber-200',
    neutral: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    outline: 'border-2 border-slate-300 text-slate-600 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 shadow-none',
    purple: 'bg-purple-500 text-white hover:bg-purple-600 shadow-purple-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-6 text-xl w-full',
    icon: 'p-2 w-10 h-10'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export { Button };
