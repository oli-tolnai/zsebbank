import { useNavigate } from 'react-router-dom';
import { useRecurringStore } from '@/stores/recurringStore';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AmountDisplay } from '@/components/common/AmountDisplay';
import { Strings } from '@/constants/strings';
import { getDaysUntil } from '@/utils/date';
import { Plus, RefreshCw } from 'lucide-react';

const frequencyLabel: Record<string, string> = {
  monthly: Strings.recurring.monthly,
  bimonthly: Strings.recurring.bimonthly,
  quarterly: Strings.recurring.quarterly,
  yearly: Strings.recurring.yearly,
};

export function RecurringPage() {
  const navigate = useNavigate();
  const templates = useRecurringStore((s) => s.templates);
  const getAccount = useAccountStore((s) => s.getAccount);

  const active = templates.filter((t) => t.isActive);
  const inactive = templates.filter((t) => !t.isActive);
  const dueSoon = active.filter((t) => getDaysUntil(t.nextDueDate) <= 7 && getDaysUntil(t.nextDueDate) >= 0);

  return (
    <div>
      <PageHeader
        title={Strings.recurring.title}
        showBack
        right={
          <button onClick={() => navigate('/recurring/new')} className="p-2 rounded-full hover:bg-slate-100">
            <Plus size={22} className="text-primary" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        {templates.length === 0 ? (
          <EmptyState
            icon={<RefreshCw size={48} />}
            title={Strings.recurring.noRecurring}
            actionLabel={Strings.recurring.addNew}
            onAction={() => navigate('/recurring/new')}
          />
        ) : (
          <>
            {dueSoon.length > 0 && (
              <Section title={Strings.recurring.dueSoon}>
                {dueSoon.map((t) => (
                  <RecurringCard key={t.id} template={t} accountName={getAccount(t.accountId)?.name} onClick={() => navigate(`/recurring/${t.id}/edit`)} />
                ))}
              </Section>
            )}
            {active.length > 0 && (
              <Section title={Strings.recurring.active}>
                {active.map((t) => (
                  <RecurringCard key={t.id} template={t} accountName={getAccount(t.accountId)?.name} onClick={() => navigate(`/recurring/${t.id}/edit`)} />
                ))}
              </Section>
            )}
            {inactive.length > 0 && (
              <Section title={Strings.recurring.inactive}>
                {inactive.map((t) => (
                  <RecurringCard key={t.id} template={t} accountName={getAccount(t.accountId)?.name} onClick={() => navigate(`/recurring/${t.id}/edit`)} />
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

function RecurringCard({ template, accountName, onClick }: { template: any; accountName?: string; onClick: () => void }) {
  const days = getDaysUntil(template.nextDueDate);
  return (
    <button onClick={onClick} className="w-full">
      <Card className="flex items-center gap-3 !p-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          template.type === 'income' ? 'bg-income-light text-income' : template.type === 'expense' ? 'bg-expense-light text-expense' : 'bg-transfer-light text-transfer'
        }`}>
          <RefreshCw size={18} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-sm text-slate-900 truncate">{template.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{frequencyLabel[template.frequency]}</span>
            {accountName && <span>· {accountName}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <AmountDisplay amount={template.amount} type={template.type} size="sm" />
          <p className="text-[10px] text-slate-400 mt-0.5">
            {days <= 0 ? 'Esedékes' : `${days} nap`}
          </p>
        </div>
      </Card>
    </button>
  );
}
