import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
  ghost: 'text-slate-600 hover:bg-slate-100 active:scale-[0.98]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-medium transition-all duration-150 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
