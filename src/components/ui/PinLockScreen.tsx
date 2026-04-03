import { useState, useCallback } from 'react';
import { Lock, Delete } from 'lucide-react';
import { Strings } from '@/constants/strings';

interface PinLockScreenProps {
  onUnlock: () => void;
  correctPin: string;
}

export function PinLockScreen({ onUnlock, correctPin }: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    },
    [pin, correctPin, onUnlock]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <Lock size={40} className="text-primary" />
        <p className="text-lg font-medium text-slate-700">
          {Strings.settings.pinEnter}
        </p>

        {/* PIN dots */}
        <div className={`flex gap-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                i < pin.length
                  ? error
                    ? 'bg-red-500'
                    : 'bg-primary'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-red-500 text-sm">{Strings.settings.pinWrong}</p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map(
            (key) => {
              if (key === '') return <div key="empty" />;
              if (key === 'back') {
                return (
                  <button
                    key="back"
                    onClick={handleBackspace}
                    className="w-16 h-16 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
                  >
                    <Delete size={24} className="text-slate-500" />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  onClick={() => handleDigit(key)}
                  className="w-16 h-16 flex items-center justify-center rounded-full text-2xl font-medium text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  {key}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
