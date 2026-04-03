import { useState, useCallback, type ChangeEvent } from 'react';

interface AmountInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
}

export function AmountInput({ label, value, onChange, error, placeholder = '0' }: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? formatDisplay(value) : '');

  function formatDisplay(num: number): string {
    if (num === 0) return '';
    return new Intl.NumberFormat('hu-HU').format(num);
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, '');
      if (raw === '') {
        setDisplayValue('');
        onChange(0);
        return;
      }
      const num = parseInt(raw, 10);
      if (isNaN(num)) return;
      setDisplayValue(formatDisplay(num));
      onChange(num);
    },
    [onChange]
  );

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-4 py-2.5 pr-12 text-base outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-primary'
          }`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Ft</span>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
