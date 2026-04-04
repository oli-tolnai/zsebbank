import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDebtStore } from '@/stores/debtStore';
import { useAccountStore } from '@/stores/accountStore';
import { useLabelStore } from '@/stores/labelStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AccountPicker } from '@/components/common/AccountPicker';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf, formatDate } from '@/utils/format';
import { showToast } from '@/components/ui/Toast';
import { Edit, Trash2, HandCoins, CheckCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function DebtDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const getDebt = useDebtStore((s) => s.getDebt);
  const { settleDebt, deleteDebt } = useDebtStore();
  const getAccount = useAccountStore((s) => s.getAccount);
  const accounts = useAccountStore((s) => s.accounts);
  const getLabel = useLabelStore((s) => s.getLabel);

  const debt = id ? getDebt(id) : undefined;
  const [showSettle, setShowSettle] = useState(false);
  const [settleAccountId, setSettleAccountId] = useState(accounts[0]?.id ?? '');
  const [showDelete, setShowDelete] = useState(false);

  if (!debt) {
    return (
      <div>
        <PageHeader title="" showBack />
        <EmptyState icon={<HandCoins size={48} />} title="Tartozás nem található" />
      </div>
    );
  }

  const isOwedToMe = debt.direction === 'they_owe_me';
  const labels = debt.labelIds.map((lid) => getLabel(lid)).filter(Boolean);
  const settledAccount = debt.settledAccountId ? getAccount(debt.settledAccountId) : null;

  const handleSettle = async () => {
    try {
      await settleDebt(debt.id, settleAccountId);
      showToast('success', 'Tartozás teljesítve!');
      setShowSettle(false);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDebt(debt.id);
      showToast('success', 'Tartozás törölve!');
      navigate('/debts');
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title={Strings.debt.title}
        showBack
        right={
          debt.status === 'pending' ? (
            <button onClick={() => navigate(`/debts/${id}/edit`)} className="p-2 rounded-full hover:bg-slate-100">
              <Edit size={20} className="text-slate-600" />
            </button>
          ) : undefined
        }
      />
      <div className="px-4 py-4 space-y-4">
        <Card className="text-center space-y-4">
          {/* Direction badge */}
          <div className="flex items-center justify-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              isOwedToMe ? 'bg-income-light text-income' : 'bg-expense-light text-expense'
            }`}>
              {isOwedToMe ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
              {isOwedToMe ? Strings.debt.theyOweMe : Strings.debt.iOweThem}
            </div>
            {debt.status === 'settled' && (
              <Badge color="#22c55e">
                <CheckCircle size={12} />
                {Strings.debt.settled}
              </Badge>
            )}
          </div>

          {/* Person & amount */}
          <div>
            <p className="text-2xl font-bold text-slate-900">{debt.personName}</p>
            <p className={`text-3xl font-bold mt-1 tabular-nums ${isOwedToMe ? 'text-income' : 'text-expense'}`}>
              {isOwedToMe ? '+' : '-'}{formatHuf(debt.amount)}
            </p>
          </div>

          {/* Reason */}
          <p className="text-base text-slate-700">{debt.name}</p>

          {/* Date */}
          <p className="text-sm text-slate-500">{formatDate(debt.date)}</p>

          {/* Labels */}
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

          {/* Description */}
          {debt.description && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 text-left">
              {debt.description}
            </div>
          )}

          {/* Settled info */}
          {debt.status === 'settled' && settledAccount && debt.settledAt && (
            <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
              <p className="font-medium">{Strings.debt.settledOn}: {formatDate(debt.settledAt)}</p>
              <p>
                {isOwedToMe ? 'Jóváírva' : 'Levonva'}: {settledAccount.name}
              </p>
            </div>
          )}
        </Card>

        {/* Settle button */}
        {debt.status === 'pending' && (
          <Button fullWidth onClick={() => setShowSettle(true)}>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              {Strings.debt.settle}
            </div>
          </Button>
        )}

        {/* Delete */}
        <Button variant="danger" fullWidth onClick={() => setShowDelete(true)}>
          <div className="flex items-center justify-center gap-2">
            <Trash2 size={18} />
            {Strings.common.delete}
          </div>
        </Button>
      </div>

      {/* Settle Modal */}
      <Modal
        isOpen={showSettle}
        onClose={() => setShowSettle(false)}
        title={Strings.debt.settle}
      >
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600">
            {isOwedToMe
              ? `${debt.personName} kifizette a ${formatHuf(debt.amount)}-ot. Melyik számlára érkezett?`
              : `Kifizeted a ${formatHuf(debt.amount)}-ot. Melyik számláról vonódjon le?`
            }
          </p>
          <AccountPicker
            label={isOwedToMe ? Strings.debt.settleAccount : Strings.debt.settleFromAccount}
            value={settleAccountId}
            onChange={setSettleAccountId}
          />
          <Button fullWidth onClick={handleSettle}>
            {Strings.debt.settle}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={Strings.common.delete}
        message={debt.status === 'settled'
          ? `${Strings.debt.deleteConfirm} ${Strings.debt.deleteSettledWarning}`
          : Strings.debt.deleteConfirm
        }
      />
    </div>
  );
}
