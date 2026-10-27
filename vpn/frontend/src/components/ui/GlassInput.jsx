import React from 'react';

export default function GlassInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 4,
  className = '',
  ...props
}) {
  const baseClasses = "w-full p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-red-400/80 shadow-inner transition-all";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`${baseClasses} resize-none ${className}`}
        {...props}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
}
