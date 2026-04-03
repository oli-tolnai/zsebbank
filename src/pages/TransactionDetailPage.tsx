import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAccountStore } from '@/stores/accountStore';
import { useLabelStore } from '@/stores/labelStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AmountDisplay } from '@/components/common/AmountDisplay';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatDate } from '@/utils/format';
import { showToast } from '@/components/ui/Toast';
import { Edit, Trash2, Receipt, ArrowRight } from 'lucide-react';
import type { Transaction } from '@/types';

export function TransactionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getById, deleteTransaction } = useTransactionStore();
  const getAccount = useAccountStore((s) => s.getAccount);
  const getLabel = useLabelStore((s) => s.getLabel);
  const [tx, setTx] = useState<Transaction | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (id) getById(id).then((t) => setTx(t ?? null));
  }, [id, getById]);

  if (!tx) {
    return (
      <div>
        <PageHeader title="" showBack />
        <EmptyState icon={<Receipt size={48} />} title="Tranzakció nem található" />
      </div>
    );
  }

  const account = getAccount(tx.accountId);
  const toAccount = tx.toAccountId ? getAccount(tx.toAccountId) : null;
  const labels = tx.labelIds.map((lid) => getLabel(lid)).filter(Boolean);

  const handleDelete = async () => {
    try {
      await deleteTransaction(tx.id);
      showToast('success', 'Tranzakció törölve!');
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title={Strings.transaction.title}
        showBack
        right={
          <button onClick={() => navigate(`/transaction/${id}/edit`)} className="p-2 rounded-full hover:bg-slate-100">
            <Edit size={20} className="text-slate-600" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        <Card className="text-center space-y-4">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            tx.type === 'income' ? 'bg-income-light text-income' :
            tx.type === 'expense' ? 'bg-expense-light text-expense' :
            'bg-transfer-light text-transfer'
          }`}>
            {tx.type === 'income' ? Strings.transaction.income : tx.type === 'expense' ? Strings.transaction.expense : Strings.transaction.transfer}
          </div>

          <div>
            <p className="text-lg font-semibold">{tx.name}</p>
            <AmountDisplay amount={tx.amount} type={tx.type} size="lg" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            {account && (
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: account.color }}>
                  <DynamicIcon name={account.icon} size={12} />
                </span>
                {account.name}
              </span>
            )}
            {toAccount && (
              <>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: toAccount.color }}>
                    <DynamicIcon name={toAccount.icon} size={12} />
                  </span>
                  {toAccount.name}
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-slate-500">{formatDate(tx.date)}</p>

          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {labels.map((label) => label && (
                <Badge key={label.id} color={label.color}>
                  <DynamicIcon name={label.icon} size={12} />
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          {tx.description && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 text-left">
              {tx.description}
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
        message={Strings.transaction.deleteConfirm}
      />
    </div>
  );
}
