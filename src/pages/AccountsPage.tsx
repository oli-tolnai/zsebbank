import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Strings } from '@/constants/strings';
import { formatHuf } from '@/utils/format';
import { Plus, Wallet, Landmark, Banknote } from 'lucide-react';

export function AccountsPage() {
  const navigate = useNavigate();
  const accounts = useAccountStore((s) => s.accounts);
  const totalBalance = useAccountStore((s) => s.totalBalance);
  const cashBalance = useAccountStore((s) => s.cashBalance);
  const bankBalance = useAccountStore((s) => s.bankBalance);

  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');

  return (
    <div>
      <PageHeader
        title={Strings.account.title}
        right={
          <button onClick={() => navigate('/accounts/new')} className="p-2 rounded-full hover:bg-slate-100">
            <Plus size={22} className="text-primary" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="text-center">
            <Wallet size={18} className="text-primary mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">{Strings.account.totalAll}</p>
            <p className="text-sm font-bold tabular-nums">{formatHuf(totalBalance())}</p>
          </Card>
          <Card className="text-center">
            <Landmark size={18} className="text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">{Strings.account.totalBank}</p>
            <p className="text-sm font-bold tabular-nums">{formatHuf(bankBalance())}</p>
          </Card>
          <Card className="text-center">
            <Banknote size={18} className="text-green-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">{Strings.account.totalCash}</p>
            <p className="text-sm font-bold tabular-nums">{formatHuf(cashBalance())}</p>
          </Card>
        </div>

        {accounts.length === 0 ? (
          <EmptyState
            icon={<Wallet size={48} />}
            title={Strings.dashboard.noAccounts}
            actionLabel={Strings.account.addNew}
            onAction={() => navigate('/accounts/new')}
          />
        ) : (
          <>
            {bankAccounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">{Strings.account.bank}</h3>
                <div className="space-y-2">
                  {bankAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onClick={() => navigate(`/accounts/${account.id}`)} />
                  ))}
                </div>
              </div>
            )}
            {cashAccounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">{Strings.account.cashType}</h3>
                <div className="space-y-2">
                  {cashAccounts.map((account) => (
                    <AccountCard key={account.id} account={account} onClick={() => navigate(`/accounts/${account.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account, onClick }: { account: { id: string; name: string; icon: string; color: string; balance: number; type: string }; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full">
      <Card className="flex items-center gap-3 !p-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: account.color }}>
          <DynamicIcon name={account.icon} size={20} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-slate-900 truncate">{account.name}</p>
          <p className="text-xs text-slate-500">{account.type === 'bank' ? Strings.account.bank : Strings.account.cashType}</p>
        </div>
        <p className="text-base font-semibold tabular-nums shrink-0">{formatHuf(account.balance)}</p>
      </Card>
    </button>
  );
}
