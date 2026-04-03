import { useNavigate } from 'react-router-dom';
import { usePiggyStore } from '@/stores/piggyStore';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf } from '@/utils/format';
import { Plus, PiggyBank } from 'lucide-react';

export function PiggyBanksPage() {
  const navigate = useNavigate();
  const piggyBanks = usePiggyStore((s) => s.piggyBanks);
  const getAccount = useAccountStore((s) => s.getAccount);

  return (
    <div>
      <PageHeader
        title={Strings.piggy.title}
        right={
          <button onClick={() => navigate('/piggy/new')} className="p-2 rounded-full hover:bg-slate-100">
            <Plus size={22} className="text-primary" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-3">
        {piggyBanks.length === 0 ? (
          <EmptyState
            icon={<PiggyBank size={48} />}
            title={Strings.piggy.noPiggyBanks}
            actionLabel={Strings.piggy.addNew}
            onAction={() => navigate('/piggy/new')}
          />
        ) : (
          piggyBanks.map((piggy) => {
            const linkedAcc = piggy.linkedAccountId ? getAccount(piggy.linkedAccountId) : null;
            const percentage = piggy.targetAmount > 0 ? Math.round((piggy.currentAmount / piggy.targetAmount) * 100) : 0;
            return (
              <button key={piggy.id} onClick={() => navigate(`/piggy/${piggy.id}`)} className="w-full">
                <Card className="!p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: piggy.color }}>
                      <DynamicIcon name={piggy.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">{piggy.name}</p>
                        {piggy.targetAmount > 0 && <span className="text-xs text-slate-500 shrink-0">{percentage}%</span>}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm font-semibold text-piggy tabular-nums">{formatHuf(piggy.currentAmount)}</p>
                        {piggy.targetAmount > 0 && (
                          <p className="text-xs text-slate-400">/ {formatHuf(piggy.targetAmount)}</p>
                        )}
                      </div>
                      {piggy.targetAmount > 0 && (
                        <div className="mt-2">
                          <ProgressBar current={piggy.currentAmount} target={piggy.targetAmount} color={piggy.color} />
                        </div>
                      )}
                      {linkedAcc && (
                        <p className="text-xs text-slate-400 mt-1">{linkedAcc.name}-hez kötve</p>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
