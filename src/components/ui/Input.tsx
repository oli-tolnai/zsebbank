import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export function Input({ label, error, suffix, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <div className="relative">
        <input
          className={`w-full rounded-xl border px-4 py-2.5 text-base outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
          } ${suffix ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
