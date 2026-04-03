import { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TransactionRow } from '@/components/common/TransactionRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { groupByDate } from '@/utils/format';
import { Search, Receipt } from 'lucide-react';
import type { TransactionType } from '@/types';

type FilterType = 'all' | TransactionType;

export function TransactionHistoryPage() {
  const { transactions, loadFiltered } = useTransactionStore();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFiltered({
      type: filterType === 'all' ? undefined : filterType,
      search: search || undefined,
    });
  }, [filterType, search, loadFiltered]);

  const groups = groupByDate(transactions);

  return (
    <div>
      <PageHeader title={Strings.transaction.history} showBack />
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={Strings.transaction.search}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-primary"
          />
        </div>

        <SegmentedControl
          options={[
            { value: 'all' as FilterType, label: Strings.transaction.filterAll },
            { value: 'income' as FilterType, label: Strings.transaction.income },
            { value: 'expense' as FilterType, label: Strings.transaction.expense },
            { value: 'transfer' as FilterType, label: Strings.transaction.transfer },
          ]}
          value={filterType}
          onChange={setFilterType}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={<Receipt size={48} />} title={Strings.transaction.noTransactions} />
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.date}>
              <div className="px-4 py-2 bg-slate-50">
                <p className="text-xs font-medium text-slate-500">{group.formattedDate}</p>
              </div>
              <div className="divide-y divide-slate-50">
                {group.items.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
