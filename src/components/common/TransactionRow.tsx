import { useNavigate } from 'react-router-dom';
import type { Transaction } from '@/types';
import { useAccountStore } from '@/stores/accountStore';
import { useLabelStore } from '@/stores/labelStore';
import { AmountDisplay } from './AmountDisplay';
import { DynamicIcon } from './DynamicIcon';
import { ArrowRightLeft } from 'lucide-react';
import { formatDateShort } from '@/utils/format';

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const navigate = useNavigate();
  const getAccount = useAccountStore((s) => s.getAccount);
  const getLabel = useLabelStore((s) => s.getLabel);

  const account = getAccount(transaction.accountId);
  const toAccount = transaction.toAccountId ? getAccount(transaction.toAccountId) : null;
  const firstLabel = transaction.labelIds.length > 0 ? getLabel(transaction.labelIds[0]) : null;

  return (
    <button
      onClick={() => navigate(`/transaction/${transaction.id}`)}
      className="w-full flex items-center gap-3 py-3 px-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: firstLabel
            ? `${firstLabel.color}20`
            : transaction.type === 'transfer'
              ? '#e0e7ff'
              : transaction.type === 'income'
                ? '#dcfce7'
                : '#fee2e2',
          color: firstLabel?.color ?? (transaction.type === 'income' ? '#22c55e' : transaction.type === 'expense' ? '#ef4444' : '#6366f1'),
        }}
      >
        {transaction.type === 'transfer' ? (
          <ArrowRightLeft size={18} />
        ) : firstLabel ? (
          <DynamicIcon name={firstLabel.icon} size={18} />
        ) : (
          <DynamicIcon name={transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown'} size={18} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{transaction.name}</p>
        <p className="text-xs text-slate-500 truncate">
          {transaction.type === 'transfer' && account && toAccount
            ? `${account.name} → ${toAccount.name}`
            : account?.name ?? ''}
        </p>
      </div>

      <div className="text-right shrink-0">
        <AmountDisplay amount={transaction.amount} type={transaction.type} size="sm" />
        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(transaction.date)}</p>
      </div>
    </button>
  );
}
