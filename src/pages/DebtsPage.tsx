import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebtStore } from '@/stores/debtStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Strings } from '@/constants/strings';
import { formatHuf, formatDateShort } from '@/utils/format';
import { Plus, HandCoins, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Debt, DebtDirection } from '@/types';

type Filter = 'all' | DebtDirection;

export function DebtsPage() {
  const navigate = useNavigate();
  const debts = useDebtStore((s) => s.debts);
  const totalOwedToMe = useDebtStore((s) => s.totalOwedToMe);
  const totalIOwe = useDebtStore((s) => s.totalIOwe);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return debts;
    return debts.filter((d) => d.direction === filter);
  }, [debts, filter]);

  const pending = useMemo(() => filtered.filter((d) => d.status === 'pending'), [filtered]);
  const settled = useMemo(() => filtered.filter((d) => d.status === 'settled'), [filtered]);

  return (
    <div>
      <PageHeader
        title={Strings.debt.title}
        showBack
        right={
          <button onClick={() => navigate('/debts/new')} className="p-2 rounded-full hover:bg-slate-100">
            <Plus size={22} className="text-primary" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        {debts.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <Card className="text-center">
              <ArrowDownLeft size={18} className="text-income mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">{Strings.debt.totalOwedToMe}</p>
              <p className="text-sm font-bold text-income tabular-nums">{formatHuf(totalOwedToMe())}</p>
            </Card>
            <Card className="text-center">
              <ArrowUpRight size={18} className="text-expense mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">{Strings.debt.totalIOwe}</p>
              <p className="text-sm font-bold text-expense tabular-nums">{formatHuf(totalIOwe())}</p>
            </Card>
          </div>
        )}

        <SegmentedControl
          options={[
            { value: 'all' as Filter, label: Strings.debt.all },
            { value: 'they_owe_me' as Filter, label: Strings.debt.theyOweMe },
            { value: 'i_owe_them' as Filter, label: Strings.debt.iOweThem },
          ]}
          value={filter}
          onChange={setFilter}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<HandCoins size={48} />}
            title={Strings.debt.noDebts}
            actionLabel={Strings.debt.addNew}
            onAction={() => navigate('/debts/new')}
          />
        ) : (
          <>
            {pending.length > 0 && (
              <Section title={Strings.debt.pending}>
                {pending.map((debt) => (
                  <DebtCard key={debt.id} debt={debt} onClick={() => navigate(`/debts/${debt.id}`)} />
                ))}
              </Section>
            )}
            {settled.length > 0 && (
              <Section title={Strings.debt.settled}>
                {settled.map((debt) => (
                  <DebtCard key={debt.id} debt={debt} onClick={() => navigate(`/debts/${debt.id}`)} />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DebtCard({ debt, onClick }: { debt: Debt; onClick: () => void }) {
  const isOwedToMe = debt.direction === 'they_owe_me';
  return (
    <button onClick={onClick} className="w-full">
      <Card className="flex items-center gap-3 !p-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isOwedToMe ? 'bg-income-light text-income' : 'bg-expense-light text-expense'
        }`}>
          {isOwedToMe ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm text-slate-900 truncate">{debt.personName}</p>
            {debt.status === 'settled' && (
              <Badge color="#22c55e">{Strings.debt.settled}</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">{debt.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`font-semibold text-sm tabular-nums ${isOwedToMe ? 'text-income' : 'text-expense'}`}>
            {isOwedToMe ? '+' : '-'}{formatHuf(debt.amount)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(debt.date)}</p>
        </div>
      </Card>
    </button>
  );
}
