import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useLabelStore } from '@/stores/labelStore';
import { useRecurringStore } from '@/stores/recurringStore';
import { usePiggyStore } from '@/stores/piggyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { seedDefaults } from '@/db/seed';
import { PinLockScreen } from '@/components/ui/PinLockScreen';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { ToastContainer } from '@/components/ui/Toast';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const pin = useSettingsStore((s) => s.pin);
  const isLocked = useSettingsStore((s) => s.isLocked);
  const unlock = useSettingsStore((s) => s.unlock);
  const isSettingsLoaded = useSettingsStore((s) => s.isLoaded);
  const accountsLoaded = useAccountStore((s) => s.isLoaded);
  const accounts = useAccountStore((s) => s.accounts);

  useEffect(() => {
    const init = async () => {
      await seedDefaults();
      await useSettingsStore.getState().load();
      await useLabelStore.getState().load();
      await useAccountStore.getState().load();
      await useTransactionStore.getState().load();
      await useRecurringStore.getState().load();
      await usePiggyStore.getState().load();

      // Execute due recurring transactions
      try {
        await useRecurringStore.getState().executeDue();
      } catch {
        // Silently handle
      }

      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady && accountsLoaded && accounts.length === 0) {
      setShowOnboarding(true);
    }
  }, [isReady, accountsLoaded, accounts.length]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-4 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">Betöltés...</p>
        </div>
      </div>
    );
  }

  // PIN lock
  if (isSettingsLoaded && pin && isLocked) {
    return (
      <>
        <PinLockScreen correctPin={pin} onUnlock={unlock} />
        <ToastContainer />
      </>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <>
        <OnboardingPage onComplete={() => setShowOnboarding(false)} />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
