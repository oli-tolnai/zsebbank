import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePiggyStore } from '@/stores/piggyStore';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Strings } from '@/constants/strings';
import { AccountColors } from '@/constants/colors';
import { showToast } from '@/components/ui/Toast';

const iconOptions = ['PiggyBank', 'Palmtree', 'Plane', 'Home', 'Car', 'GraduationCap', 'Heart', 'Gift', 'Smartphone', 'Gem', 'Target', 'Star'];

export function PiggyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const accounts = useAccountStore((s) => s.accounts);
  const { piggyBanks, addPiggyBank, updatePiggyBank } = usePiggyStore();
  const existing = id ? piggyBanks.find((p) => p.id === id) : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(existing?.targetAmount ?? 0);
  const [linkedAccountId, setLinkedAccountId] = useState(existing?.linkedAccountId ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'PiggyBank');
  const [color, setColor] = useState(existing?.color ?? '#ec4899');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!existing;

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'A név kötelező.';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    try {
      if (isEdit) {
        await updatePiggyBank(id!, { name: name.trim(), targetAmount, linkedAccountId: linkedAccountId || null, icon, color });
        showToast('success', 'Persely módosítva!');
      } else {
        await addPiggyBank({ name: name.trim(), targetAmount, linkedAccountId: linkedAccountId || null, icon, color });
        showToast('success', 'Persely létrehozva!');
      }
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? Strings.piggy.edit : Strings.piggy.addNew} showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="space-y-4">
            <Input label={Strings.piggy.name} value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }} placeholder="pl. Nyaralás, Megtakarítás..." error={errors.name} />
            <AmountInput label={`${Strings.piggy.target} (${Strings.common.optional})`} value={targetAmount} onChange={setTargetAmount} placeholder="0 = nincs célösszeg" />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{Strings.piggy.linkedAccount} <span className="text-slate-400">({Strings.common.optional})</span></label>
              <select
                value={linkedAccountId}
                onChange={(e) => setLinkedAccountId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none focus:border-primary"
              >
                <option value="">{Strings.piggy.noLinked}</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.account.icon}</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((ic) => (
                  <button key={ic} type="button" onClick={() => setIcon(ic)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${icon === ic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <DynamicIcon name={ic} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.account.color}</label>
              <div className="flex flex-wrap gap-2">
                {AccountColors.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </Card>
        <Button fullWidth onClick={handleSave}>{Strings.common.save}</Button>
      </div>
    </div>
  );
}
