import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PinSetup } from '@/components/ui/PinSetup';
import { PinLockScreen } from '@/components/ui/PinLockScreen';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';

export function PinSettingsPage() {
  const { pin, setPin, removePin } = useSettingsStore();
  const [mode, setMode] = useState<'view' | 'setup' | 'verify-remove'>('view');

  const handleSetPin = async (newPin: string) => {
    await setPin(newPin);
    showToast('success', 'PIN kód beállítva!');
    setMode('view');
  };

  const handleRemovePin = async () => {
    await removePin();
    showToast('success', 'PIN kód törölve!');
    setMode('view');
  };

  if (mode === 'setup') {
    return (
      <div>
        <PageHeader title={pin ? Strings.settings.pinChange : Strings.settings.pinSetup} showBack />
        <PinSetup onComplete={handleSetPin} onCancel={() => setMode('view')} />
      </div>
    );
  }

  if (mode === 'verify-remove' && pin) {
    return (
      <div>
        <PageHeader title={Strings.settings.pinRemove} showBack />
        <div className="pt-8">
          <PinLockScreen correctPin={pin} onUnlock={handleRemovePin} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={Strings.settings.pin} showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <p className="text-sm text-slate-600 mb-4">
            {pin ? 'PIN kód be van állítva. A belépéshez szükséges a megadása.' : 'Nincs PIN kód beállítva.'}
          </p>
          <div className="space-y-2">
            <Button fullWidth onClick={() => setMode('setup')}>
              {pin ? Strings.settings.pinChange : Strings.settings.pinSetup}
            </Button>
            {pin && (
              <Button variant="danger" fullWidth onClick={() => setMode('verify-remove')}>
                {Strings.settings.pinRemove}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
