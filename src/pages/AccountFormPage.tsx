import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { Strings } from '@/constants/strings';
import { AccountColors } from '@/constants/colors';
import { showToast } from '@/components/ui/Toast';
import type { AccountType } from '@/types';

const iconOptions = [
  'Landmark', 'CreditCard', 'Wallet', 'Vault', 'Banknote', 'Coins',
  'Building2', 'Globe', 'Smartphone', 'PiggyBank', 'DollarSign', 'Lock',
];

export function AccountFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accounts, addAccount, updateAccount } = useAccountStore();
  const existingAccount = id ? accounts.find((a) => a.id === id) : null;

  const [name, setName] = useState(existingAccount?.name ?? '');
  const [type, setType] = useState<AccountType>(existingAccount?.type ?? 'bank');
  const [balance, setBalance] = useState(existingAccount?.balance ?? 0);
  const [icon, setIcon] = useState(existingAccount?.icon ?? 'Landmark');
  const [color, setColor] = useState(existingAccount?.color ?? AccountColors[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!existingAccount;

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'A név kötelező.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEdit) {
        await updateAccount(id!, { name: name.trim(), type, icon, color });
        showToast('success', 'Számla módosítva!');
      } else {
        await addAccount({
          name: name.trim(),
          type,
          balance,
          icon,
          color,
          order: accounts.length,
        });
        showToast('success', 'Számla létrehozva!');
      }
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader title={isEdit ? Strings.account.edit : Strings.account.addNew} showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="space-y-4">
            <Input
              label={Strings.account.name}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors({}); }}
              placeholder="pl. OTP, Revolut, Tárca..."
              error={errors.name}
            />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{Strings.account.type}</label>
              <SegmentedControl
                options={[
                  { value: 'bank' as AccountType, label: Strings.account.bank },
                  { value: 'cash' as AccountType, label: Strings.account.cashType },
                ]}
                value={type}
                onChange={setType}
              />
            </div>

            {!isEdit && (
              <AmountInput
                label={Strings.account.startingBalance}
                value={balance}
                onChange={setBalance}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.account.icon}</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      icon === ic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <DynamicIcon name={ic} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.account.color}</label>
              <div className="flex flex-wrap gap-2">
                {AccountColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
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
