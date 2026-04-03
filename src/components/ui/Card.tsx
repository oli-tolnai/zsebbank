import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

export function Card({ children, padding = true, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padding ? 'p-4' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
