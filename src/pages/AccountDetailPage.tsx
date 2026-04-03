import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TransactionRow } from '@/components/common/TransactionRow';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf } from '@/utils/format';
import { showToast } from '@/components/ui/Toast';
import { Edit, Trash2, Receipt } from 'lucide-react';
import type { Transaction } from '@/types';

export function AccountDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const getAccount = useAccountStore((s) => s.getAccount);
  const deleteAccount = useAccountStore((s) => s.deleteAccount);
  const getByAccount = useTransactionStore((s) => s.getByAccount);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  const account = id ? getAccount(id) : undefined;

  useEffect(() => {
    if (id) {
      getByAccount(id, 30).then(setTransactions);
    }
  }, [id, getByAccount]);

  if (!account) {
    return (
      <div>
        <PageHeader title="" showBack />
        <EmptyState icon={<Receipt size={48} />} title="Számla nem található" />
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id);
      showToast('success', 'Számla törölve!');
      navigate('/accounts');
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title={account.name}
        showBack
        right={
          <button onClick={() => navigate(`/accounts/${id}/edit`)} className="p-2 rounded-full hover:bg-slate-100">
            <Edit size={20} className="text-slate-600" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        <Card className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white mx-auto mb-3" style={{ backgroundColor: account.color }}>
            <DynamicIcon name={account.icon} size={28} />
          </div>
          <p className="text-sm text-slate-500">{account.type === 'bank' ? Strings.account.bank : Strings.account.cashType}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{formatHuf(account.balance)}</p>
        </Card>

        <Card padding={false}>
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-semibold text-slate-900">{Strings.dashboard.recentTransactions}</h3>
          </div>
          {transactions.length === 0 ? (
            <EmptyState icon={<Receipt size={32} />} title={Strings.transaction.noTransactions} />
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </Card>

        <Button variant="danger" fullWidth onClick={() => setShowDelete(true)}>
          <div className="flex items-center justify-center gap-2">
            <Trash2 size={18} />
            {Strings.common.delete}
          </div>
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={Strings.common.delete}
        message={`${Strings.account.deleteConfirm}\n${Strings.account.deleteWarning}`}
      />
    </div>
  );
}
