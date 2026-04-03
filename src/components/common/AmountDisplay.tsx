import { formatHuf } from '@/utils/format';
import type { TransactionType } from '@/types';

interface AmountDisplayProps {
  amount: number;
  type?: TransactionType;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export function AmountDisplay({ amount, type, size = 'md', showSign = true }: AmountDisplayProps) {
  let colorClass = 'text-slate-900';
  let prefix = '';

  if (type === 'income') {
    colorClass = 'text-income';
    if (showSign) prefix = '+';
  } else if (type === 'expense') {
    colorClass = 'text-expense';
    if (showSign) prefix = '-';
  } else if (type === 'transfer') {
    colorClass = 'text-transfer';
  }

  return (
    <span className={`${colorClass} ${sizeClasses[size]} font-semibold tabular-nums`}>
      {prefix}{formatHuf(amount)}
    </span>
  );
}
