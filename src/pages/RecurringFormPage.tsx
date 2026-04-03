import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecurringStore } from '@/stores/recurringStore';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AccountPicker } from '@/components/common/AccountPicker';
import { LabelPicker } from '@/components/common/LabelPicker';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';
import { getToday } from '@/utils/format';
import { Trash2 } from 'lucide-react';
import type { TransactionType, Frequency } from '@/types';

export function RecurringFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accounts = useAccountStore((s) => s.accounts);
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useRecurringStore();
  const existing = id ? templates.find((t) => t.id === id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(existing?.toAccountId ?? '');
  const [labelIds, setLabelIds] = useState<string[]>(existing?.labelIds ?? []);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? 'monthly');
  const [nextDueDate, setNextDueDate] = useState(existing?.nextDueDate ?? getToday());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);

  const isEdit = !!existing;

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'A megnevezés kötelező.';
    if (amount <= 0) newErrors.amount = 'Az összeg kötelező.';
    if (!accountId) newErrors.account = 'Válassz számlát.';
    if (type === 'transfer' && !toAccountId) newErrors.toAccount = 'Válassz cél számlát.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      const data = {
        name: name.trim(),
        type,
        amount,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : null,
        labelIds,
        description: description.trim() || null,
        frequency,
        nextDueDate,
      };

      if (isEdit) {
        await updateTemplate(id!, data);
        showToast('success', 'Ismétlődő módosítva!');
      } else {
        await addTemplate(data);
        showToast('success', 'Ismétlődő létrehozva!');
      }
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTemplate(id!);
      showToast('success', 'Ismétlődő törölve!');
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? Strings.recurring.edit : Strings.recurring.addNew} showBack />
      <div className="px-4 py-4 space-y-4">
        <SegmentedControl
          options={[
            { value: 'income' as TransactionType, label: Strings.transaction.income },
            { value: 'expense' as TransactionType, label: Strings.transaction.expense },
            { value: 'transfer' as TransactionType, label: Strings.transaction.transfer },
          ]}
          value={type}
          onChange={setType}
        />

        <Card>
          <div className="space-y-4">
            <Input
              label={Strings.transaction.name}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors({}); }}
              placeholder="pl. Albérlet, Spotify, Netflix..."
              error={errors.name}
            />
            <AmountInput label={Strings.transaction.amount} value={amount} onChange={setAmount} error={errors.amount} />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{Strings.recurring.frequency}</label>
              <SegmentedControl
                options={[
                  { value: 'monthly' as Frequency, label: Strings.recurring.monthly },
                  { value: 'bimonthly' as Frequency, label: Strings.recurring.bimonthly },
                  { value: 'quarterly' as Frequency, label: Strings.recurring.quarterly },
                  { value: 'yearly' as Frequency, label: Strings.recurring.yearly },
                ]}
                value={frequency}
                onChange={setFrequency}
              />
            </div>

            <Input label={Strings.recurring.startDate} type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />

            <AccountPicker
              label={type === 'transfer' ? Strings.transaction.fromAccount : Strings.transaction.account}
              value={accountId}
              onChange={setAccountId}
              excludeId={type === 'transfer' ? toAccountId : undefined}
              error={errors.account}
            />

            {type === 'transfer' && (
              <AccountPicker
                label={Strings.transaction.toAccount}
                value={toAccountId}
                onChange={setToAccountId}
                excludeId={accountId}
                error={errors.toAccount}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.transaction.labels}</label>
              <LabelPicker selectedIds={labelIds} onChange={setLabelIds} filterType={type === 'transfer' ? 'all' : type === 'income' ? 'income' : 'expense'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{Strings.transaction.description} <span className="text-slate-400">({Strings.common.optional})</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
        </Card>

        <Button fullWidth onClick={handleSave}>{Strings.common.save}</Button>

        {isEdit && (
          <Button variant="danger" fullWidth onClick={() => setShowDelete(true)}>
            <div className="flex items-center justify-center gap-2"><Trash2 size={18} />{Strings.common.delete}</div>
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title={Strings.common.delete}
        message="Biztosan törölni szeretnéd ezt az ismétlődő tranzakciót?"
      />
    </div>
  );
}
