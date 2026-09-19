import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  as: Component = 'div',
  ...props
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-250 overflow-hidden';
  const surfaceClasses = glass 
    ? 'bg-[#10131e]/80 backdrop-blur-xl border-white/[0.08]' 
    : 'bg-[#141726] border-white/[0.06]';
  const hoverClasses = hover 
    ? 'hover:bg-[#1a1e32] hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5' 
    : '';

  return (
    <Component className={`${baseClasses} ${surfaceClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default Card;
