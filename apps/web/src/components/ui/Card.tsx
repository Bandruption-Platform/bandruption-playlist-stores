import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
}) => {
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-dark-800 border border-dark-600',
    glass: 'bg-dark-800/50 backdrop-blur-lg border border-dark-600/50',
    elevated: 'bg-dark-800 shadow-2xl border border-dark-600',
  };
  
  const hoverClasses = hover ? 'hover:transform hover:scale-105 hover:shadow-2xl cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};