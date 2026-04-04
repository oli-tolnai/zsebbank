import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDebtStore } from '@/stores/debtStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { LabelPicker } from '@/components/common/LabelPicker';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';
import { getToday } from '@/utils/format';
import type { DebtDirection } from '@/types';

export function DebtFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { debts, addDebt, updateDebt } = useDebtStore();
  const existing = id ? debts.find((d) => d.id === id) : null;

  const [direction, setDirection] = useState<DebtDirection>(existing?.direction ?? 'they_owe_me');
  const [personName, setPersonName] = useState(existing?.personName ?? '');
  const [amount, setAmount] = useState(existing?.amount ?? 0);
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [labelIds, setLabelIds] = useState<string[]>(existing?.labelIds ?? []);
  const [date, setDate] = useState(existing?.date ?? getToday());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!existing;

  // Don't allow editing settled debts
  useEffect(() => {
    if (existing && existing.status === 'settled') {
      navigate(`/debts/${id}`, { replace: true });
    }
  }, [existing, id, navigate]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!personName.trim()) newErrors.personName = 'A név kötelező.';
    if (!name.trim()) newErrors.name = 'A megnevezés kötelező.';
    if (amount <= 0) newErrors.amount = 'Az összeg kötelező.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      if (isEdit) {
        await updateDebt(id!, {
          direction,
          personName: personName.trim(),
          amount,
          name: name.trim(),
          description: description.trim() || null,
          labelIds,
          date,
        });
        showToast('success', 'Tartozás módosítva!');
      } else {
        await addDebt({
          direction,
          personName: personName.trim(),
          amount,
          name: name.trim(),
          description: description.trim() || null,
          labelIds,
          date,
        });
        showToast('success', 'Tartozás felvéve!');
      }
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? Strings.debt.edit : Strings.debt.addNew} showBack />
      <div className="px-4 py-4 space-y-4">
        <SegmentedControl
          options={[
            { value: 'they_owe_me' as DebtDirection, label: Strings.debt.theyOweMe },
            { value: 'i_owe_them' as DebtDirection, label: Strings.debt.iOweThem },
          ]}
          value={direction}
          onChange={setDirection}
        />

        <Card>
          <div className="space-y-4">
            <Input
              label={Strings.debt.personName}
              value={personName}
              onChange={(e) => { setPersonName(e.target.value); setErrors({}); }}
              placeholder="pl. Peti, Anna..."
              error={errors.personName}
            />

            <AmountInput
              label={Strings.transaction.amount}
              value={amount}
              onChange={(v) => { setAmount(v); setErrors({}); }}
              error={errors.amount}
            />

            <Input
              label={Strings.debt.reason}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors({}); }}
              placeholder="pl. Ebéd, Mozi jegy, Közös ajándék..."
              error={errors.name}
            />

            <Input
              label={Strings.transaction.date}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.transaction.labels}</label>
              <LabelPicker selectedIds={labelIds} onChange={setLabelIds} filterType="all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {Strings.transaction.description} <span className="text-slate-400">({Strings.common.optional})</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none focus:border-primary transition-colors resize-none"
                placeholder="Megjegyzés..."
              />
            </div>
          </div>
        </Card>

        <Button fullWidth onClick={handleSave}>
          {Strings.common.save}
        </Button>
      </div>
    </div>
  );
}
