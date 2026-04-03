import { useAccountStore } from '@/stores/accountStore';
import { formatHuf } from '@/utils/format';
import { DynamicIcon } from './DynamicIcon';

interface AccountPickerProps {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  excludeId?: string;
  error?: string;
}

export function AccountPicker({ label, value, onChange, excludeId, error }: AccountPickerProps) {
  const accounts = useAccountStore((s) => s.accounts).filter((a) => a.id !== excludeId);

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-slate-600">{label}</label>}
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => onChange(account.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              value === account.id
                ? 'border-primary bg-primary-light/50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: account.color }}
            >
              <DynamicIcon name={account.icon} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-900 truncate">{account.name}</p>
              <p className="text-xs text-slate-500">{formatHuf(account.balance)}</p>
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
