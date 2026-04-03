import { useState } from 'react';
import { useAccountStore } from '@/stores/accountStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AmountInput } from '@/components/ui/AmountInput';
import { PinSetup } from '@/components/ui/PinSetup';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';
import { Wallet } from 'lucide-react';

interface PresetAccount {
  name: string;
  type: 'bank' | 'cash';
  icon: string;
  color: string;
  enabled: boolean;
  balance: number;
}

const presetAccounts: PresetAccount[] = [
  { name: 'OTP', type: 'bank', icon: 'Landmark', color: '#22c55e', enabled: false, balance: 0 },
  { name: 'Revolut', type: 'bank', icon: 'Globe', color: '#6366f1', enabled: false, balance: 0 },
  { name: 'Wise', type: 'bank', icon: 'Globe', color: '#3b82f6', enabled: false, balance: 0 },
  { name: 'Pénztárca', type: 'cash', icon: 'Wallet', color: '#f59e0b', enabled: false, balance: 0 },
  { name: 'Széf', type: 'cash', icon: 'Vault', color: '#8b5cf6', enabled: false, balance: 0 },
];

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(0);
  const [accounts, setAccounts] = useState<PresetAccount[]>(presetAccounts);
  const addAccount = useAccountStore((s) => s.addAccount);
  const setPin = useSettingsStore((s) => s.setPin);

  const toggleAccount = (index: number) => {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, enabled: !a.enabled } : a)));
  };

  const updateBalance = (index: number, balance: number) => {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, balance } : a)));
  };

  const handleCreateAccounts = async () => {
    const selected = accounts.filter((a) => a.enabled);
    for (let i = 0; i < selected.length; i++) {
      const a = selected[i];
      await addAccount({
        name: a.name,
        type: a.type,
        balance: a.balance,
        icon: a.icon,
        color: a.color,
        order: i,
      });
    }
    setStep(2);
  };

  const handlePinComplete = async (pin: string) => {
    await setPin(pin);
    showToast('success', 'PIN beállítva!');
    onComplete();
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-6">
          <Wallet size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{Strings.onboarding.welcome}</h1>
        <p className="text-slate-500 text-center mb-8">{Strings.onboarding.subtitle}</p>
        <Button fullWidth onClick={() => setStep(1)}>
          {Strings.onboarding.next}
        </Button>
      </div>
    );
  }

  // Step 1: Setup accounts
  if (step === 1) {
    const hasSelected = accounts.some((a) => a.enabled);
    return (
      <div className="min-h-full px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{Strings.onboarding.setupAccounts}</h2>
        <p className="text-sm text-slate-500 mb-6">Később bármikor adhatsz hozzá újakat.</p>
        <div className="space-y-3">
          {accounts.map((account, i) => (
            <Card key={account.name}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAccount(i)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 transition-opacity ${
                    account.enabled ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ backgroundColor: account.color }}
                >
                  <Wallet size={20} />
                </button>
                <div className="flex-1">
                  <button onClick={() => toggleAccount(i)} className="text-left">
                    <p className={`font-medium ${account.enabled ? 'text-slate-900' : 'text-slate-400'}`}>{account.name}</p>
                    <p className="text-xs text-slate-500">{account.type === 'bank' ? 'Bankszámla' : 'Készpénz'}</p>
                  </button>
                </div>
              </div>
              {account.enabled && (
                <div className="mt-3">
                  <AmountInput
                    label={Strings.onboarding.startingBalance}
                    value={account.balance}
                    onChange={(v) => updateBalance(i, v)}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Button fullWidth onClick={handleCreateAccounts} disabled={!hasSelected}>
            {Strings.onboarding.next}
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: PIN setup (optional)
  if (step === 2) {
    return (
      <div className="min-h-full px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{Strings.onboarding.setupPin}</h2>
        <PinSetup onComplete={handlePinComplete} onCancel={onComplete} />
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-slate-500 text-sm">
            {Strings.onboarding.skip}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
