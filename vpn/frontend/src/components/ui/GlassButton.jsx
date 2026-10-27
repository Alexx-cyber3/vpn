import React from 'react';

export default function GlassButton({
  children,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-2 shadow-md",
    lg: "px-5 py-3 text-sm gap-2.5 shadow-lg"
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 border border-red-400/40",
    secondary: "bg-red-950/80 hover:bg-red-900/80 text-white border border-red-500/30",
    outline: "bg-transparent hover:bg-red-500/10 text-white border border-red-500/40",
    danger: "bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white border border-red-500/50 shadow-red-900/40"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
      {children}
    </button>
  );
}
