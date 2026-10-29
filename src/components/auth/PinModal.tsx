import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storedPin: string;
  title?: string;
}

export default function PinModal({
  isOpen,
  onClose,
  onSuccess,
  storedPin,
  title = 'Masukkan PIN Owner',
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        if (newPin === storedPin) {
          setPin('');
          onSuccess();
        } else {
          setShake(true);
          setError('PIN salah!');
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 600);
        }
      }
    },
    [pin, storedPin, onSuccess]
  );

  const handleBackspace = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    setPin('');
    setError('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl p-6 w-[320px] max-w-[90vw] shadow-xl border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`flex justify-center gap-3 mb-6 ${
            shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${
                i < pin.length
                  ? 'border-brand-400 bg-brand-400/20'
                  : 'border-slate-600'
              }`}
            >
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm mb-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {digits.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                if (d === '⌫') handleBackspace();
                else if (d !== '') handleDigit(d);
              }}
              disabled={d === ''}
              className={`h-14 rounded-xl text-xl font-semibold transition-colors ${
                d === ''
                  ? 'invisible'
                  : d === '⌫'
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 active:bg-slate-600'
                  : 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-brand-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
