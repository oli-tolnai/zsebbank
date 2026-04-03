import { useState, useCallback } from 'react';
import { Lock, Delete } from 'lucide-react';
import { Strings } from '@/constants/strings';

interface PinSetupProps {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
}

export function PinSetup({ onComplete, onCancel }: PinSetupProps) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (step === 'enter') {
          setFirstPin(newPin);
          setPin('');
          setStep('confirm');
        } else {
          if (newPin === firstPin) {
            onComplete(newPin);
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setError(false);
              setStep('enter');
              setFirstPin('');
            }, 500);
          }
        }
      }
    },
    [pin, step, firstPin, onComplete]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <Lock size={40} className="text-primary" />
      <p className="text-lg font-medium text-slate-700">
        {step === 'enter' ? Strings.settings.pinNew : Strings.settings.pinConfirm}
      </p>

      <div className={`flex gap-4 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-colors ${
              i < pin.length ? (error ? 'bg-red-500' : 'bg-primary') : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{Strings.settings.pinMismatch}</p>}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key) => {
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
        })}
      </div>

      {onCancel && (
        <button onClick={onCancel} className="mt-4 text-slate-500 text-sm">
          {Strings.common.cancel}
        </button>
      )}
    </div>
  );
}
