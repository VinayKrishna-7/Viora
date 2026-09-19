import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const variants = {
    default: 'bg-white/[0.08] text-zinc-300 border border-white/[0.08]',
    accent: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25',
    violet: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
    music: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
    live: 'bg-rose-500/15 text-rose-300 border border-rose-500/25',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    outline: 'border border-white/15 text-zinc-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 font-semibold tracking-wider uppercase',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {children}
    </span>
  );
};

export default Badge;
