import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useLabelStore } from '@/stores/labelStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TransactionRow } from '@/components/common/TransactionRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Strings } from '@/constants/strings';
import { UNLABELED_ID } from '@/constants/labels';
import { groupByDate, formatHuf, formatMonth, getCurrentMonth } from '@/utils/format';
import { getMonthRange } from '@/utils/date';
import { Search, Receipt, Tag, ChevronDown, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import type { TransactionType } from '@/types';

type FilterType = 'all' | TransactionType;

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function TransactionHistoryPage() {
  const { transactions, loadFiltered, reload } = useTransactionStore();
  const allLabels = useLabelStore((s) => s.labels);
  const getLabel = useLabelStore((s) => s.getLabel);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const filterType = (searchParams.get('type') ?? 'all') as FilterType;
  const monthParam = searchParams.get('month') ?? '';
  const month = /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : '';
  const labelsParam = searchParams.get('labels') ?? '';
  const selectedLabelIds = useMemo(() => labelsParam.split(',').filter(Boolean), [labelsParam]);

  const [labelsOpen, setLabelsOpen] = useState(() => labelsParam.length > 0);

  const setParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const range = month ? getMonthRange(month) : null;
    const ids = labelsParam.split(',').filter(Boolean);
    loadFiltered({
      type: filterType === 'all' ? undefined : (filterType as TransactionType),
      search: search || undefined,
      startDate: range?.start,
      endDate: range?.end,
      labelIds: ids.filter((id) => id !== UNLABELED_ID),
      includeUnlabeled: ids.includes(UNLABELED_ID),
    });
  }, [filterType, month, labelsParam, search, loadFiltered]);

  // The store list is shared with the dashboard, so restore the unfiltered
  // list when leaving this page.
  useEffect(() => () => { void reload(); }, [reload]);

  const toggleLabel = (id: string) => {
    const next = selectedLabelIds.includes(id)
      ? selectedLabelIds.filter((lid) => lid !== id)
      : [...selectedLabelIds, id];
    setParams({ labels: next.join(',') });
  };

  // Labels offered for filtering follow the selected type, but an already
  // selected label always stays visible so it can be removed.
  const pickableLabels = useMemo(() => {
    if (filterType === 'income' || filterType === 'expense') {
      return allLabels.filter(
        (l) => l.type === filterType || l.type === 'both' || selectedLabelIds.includes(l.id)
      );
    }
    return allLabels;
  }, [allLabels, filterType, selectedLabelIds]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expense += tx.amount;
    }
    return { income, expense };
  }, [transactions]);

  const groups = groupByDate(transactions);
  const hasFilters = filterType !== 'all' || month !== '' || selectedLabelIds.length > 0 || search !== '';

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
          onChange={(value) => setParams({ type: value === 'all' ? '' : value })}
        />

        {/* Month filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setParams({ month: shiftMonth(month || getCurrentMonth(), -1) })}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Előző hónap"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setParams({ month: month ? '' : getCurrentMonth() })}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
              month ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {month ? formatMonth(month) : Strings.transaction.allMonths}
          </button>
          <button
            onClick={() => setParams({ month: shiftMonth(month || getCurrentMonth(), 1) })}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
            aria-label="Következő hónap"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Label filter */}
        <div>
          <button
            onClick={() => setLabelsOpen((open) => !open)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-600"
          >
            <span className="flex items-center gap-2">
              <Tag size={16} />
              {Strings.transaction.filterLabels}
              {selectedLabelIds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  {selectedLabelIds.length}
                </span>
              )}
            </span>
            <ChevronDown size={16} className={`transition-transform ${labelsOpen ? 'rotate-180' : ''}`} />
          </button>

          {!labelsOpen && selectedLabelIds.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {selectedLabelIds.map((id) => {
                const label = getLabel(id);
                const name = id === UNLABELED_ID ? Strings.transaction.noLabel : label?.name ?? '?';
                const color = label?.color ?? '#94a3b8';
                return (
                  <button
                    key={id}
                    onClick={() => toggleLabel(id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {label && <DynamicIcon name={label.icon} size={14} />}
                    {name}
                    <X size={14} />
                  </button>
                );
              })}
            </div>
          )}

          {labelsOpen && (
            <div className="flex flex-wrap gap-2 pb-1">
              {pickableLabels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isSelected ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={isSelected ? { backgroundColor: label.color } : undefined}
                  >
                    <DynamicIcon name={label.icon} size={14} />
                    {label.name}
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
              <button
                onClick={() => toggleLabel(UNLABELED_ID)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedLabelIds.includes(UNLABELED_ID)
                    ? 'bg-slate-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {Strings.transaction.noLabel}
                {selectedLabelIds.includes(UNLABELED_ID) && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setSearch('');
              setSearchParams(new URLSearchParams(), { replace: true });
            }}
            className="text-xs text-slate-400 underline"
          >
            {Strings.transaction.clearFilters}
          </button>
        )}

        {/* Summary of the current filter */}
        {transactions.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs">
            <span className="text-slate-500">
              {transactions.length} {Strings.transaction.resultsCount}
            </span>
            <span className="flex items-center gap-3 tabular-nums">
              {totals.income > 0 && <span className="text-income font-semibold">+{formatHuf(totals.income)}</span>}
              {totals.expense > 0 && <span className="text-expense font-semibold">-{formatHuf(totals.expense)}</span>}
            </span>
          </div>
        )}
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
