import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePiggyStore } from '@/stores/piggyStore';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AmountInput } from '@/components/ui/AmountInput';
import { AccountPicker } from '@/components/common/AccountPicker';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/common/ProgressBar';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf, formatDate } from '@/utils/format';
import { showToast } from '@/components/ui/Toast';
import { Edit, Trash2, PiggyBank, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { PiggyTransaction } from '@/types';

export function PiggyDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const getPiggyBank = usePiggyStore((s) => s.getPiggyBank);
  const { deposit, withdraw, getTransactions, deletePiggyBank } = usePiggyStore();
  const getAccount = useAccountStore((s) => s.getAccount);
  const accounts = useAccountStore((s) => s.accounts);

  const piggy = id ? getPiggyBank(id) : undefined;
  const [piggyTxs, setPiggyTxs] = useState<PiggyTransaction[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [modalAmount, setModalAmount] = useState(0);
  const [modalAccountId, setModalAccountId] = useState('');

  useEffect(() => {
    if (id) getTransactions(id).then(setPiggyTxs);
  }, [id, getTransactions, piggy?.currentAmount]);

  useEffect(() => {
    if (piggy?.linkedAccountId) {
      setModalAccountId(piggy.linkedAccountId);
    } else if (accounts.length > 0) {
      setModalAccountId(accounts[0].id);
    }
  }, [piggy, accounts]);

  if (!piggy) {
    return (
      <div>
        <PageHeader title="" showBack />
        <EmptyState icon={<PiggyBank size={48} />} title="Persely nem található" />
      </div>
    );
  }

  const percentage = piggy.targetAmount > 0 ? Math.round((piggy.currentAmount / piggy.targetAmount) * 100) : 0;
  const linkedAcc = piggy.linkedAccountId ? getAccount(piggy.linkedAccountId) : null;

  const handleAction = async () => {
    if (!showModal || modalAmount <= 0) return;
    try {
      if (showModal === 'deposit') {
        await deposit(piggy.id, modalAccountId, modalAmount);
        showToast('success', 'Befizetés sikeres!');
      } else {
        await withdraw(piggy.id, modalAccountId, modalAmount);
        showToast('success', 'Kivétel sikeres!');
      }
      setShowModal(null);
      setModalAmount(0);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePiggyBank(piggy.id);
      showToast('success', 'Persely törölve!');
      navigate('/piggy');
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title={piggy.name}
        showBack
        right={
          <button onClick={() => navigate(`/piggy/${id}/edit`)} className="p-2 rounded-full hover:bg-slate-100">
            <Edit size={20} className="text-slate-600" />
          </button>
        }
      />
      <div className="px-4 py-4 space-y-4">
        <Card className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto" style={{ backgroundColor: piggy.color }}>
            <DynamicIcon name={piggy.icon} size={32} />
          </div>
          <p className="text-3xl font-bold text-piggy tabular-nums">{formatHuf(piggy.currentAmount)}</p>
          {piggy.targetAmount > 0 && (
            <>
              <p className="text-sm text-slate-500">/ {formatHuf(piggy.targetAmount)} ({percentage}%)</p>
              <ProgressBar current={piggy.currentAmount} target={piggy.targetAmount} color={piggy.color} height={10} />
            </>
          )}
          {linkedAcc && <p className="text-xs text-slate-500">{linkedAcc.name}-hez kötve</p>}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="primary" fullWidth onClick={() => setShowModal('deposit')}>
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle size={18} />
              {Strings.piggy.deposit}
            </div>
          </Button>
          <Button variant="secondary" fullWidth onClick={() => setShowModal('withdraw')}>
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle size={18} />
              {Strings.piggy.withdraw}
            </div>
          </Button>
        </div>

        {piggyTxs.length > 0 && (
          <Card padding={false}>
            <div className="px-4 pt-4 pb-2">
              <h3 className="font-semibold text-slate-900">Tranzakciók</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {piggyTxs.map((ptx) => {
                const acc = getAccount(ptx.accountId);
                return (
                  <div key={ptx.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{ptx.type === 'deposit' ? 'Befizetés' : 'Kivétel'}</p>
                      <p className="text-xs text-slate-500">{acc?.name} · {formatDate(ptx.date)}</p>
                    </div>
                    <span className={`font-semibold text-sm ${ptx.type === 'deposit' ? 'text-income' : 'text-expense'}`}>
                      {ptx.type === 'deposit' ? '+' : '-'}{formatHuf(ptx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Button variant="danger" fullWidth onClick={() => setShowDelete(true)}>
          <div className="flex items-center justify-center gap-2"><Trash2 size={18} />{Strings.common.delete}</div>
        </Button>
      </div>

      {/* Deposit/Withdraw Modal */}
      <Modal
        isOpen={showModal !== null}
        onClose={() => { setShowModal(null); setModalAmount(0); }}
        title={showModal === 'deposit' ? Strings.piggy.deposit : Strings.piggy.withdraw}
      >
        <div className="p-4 space-y-4">
          <AmountInput
            label={Strings.transaction.amount}
            value={modalAmount}
            onChange={setModalAmount}
          />
          <AccountPicker
            label={showModal === 'deposit' ? Strings.piggy.fromAccount : Strings.piggy.toAccount}
            value={modalAccountId}
            onChange={setModalAccountId}
          />
          <Button fullWidth onClick={handleAction} disabled={modalAmount <= 0}>
            {showModal === 'deposit' ? Strings.piggy.deposit : Strings.piggy.withdraw}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={Strings.common.delete}
        message={Strings.piggy.deleteConfirm}
      />
    </div>
  );
}
