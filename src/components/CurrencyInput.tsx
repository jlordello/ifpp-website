import React from 'react';
import { parseCurrencyBRL, formatCurrencyBRL, getExtensoSintetico } from '../lib/currency';
import { Check } from 'lucide-react';

interface CurrencyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showQuickChips?: boolean;
  autoFormatOnBlur?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Ex: 400.000,00 ou 400000',
  required = false,
  className = '',
  showQuickChips = true,
  autoFormatOnBlur = true,
}) => {
  const parsedValue = parseCurrencyBRL(value);
  const extenso = getExtensoSintetico(parsedValue);

  const handleBlur = () => {
    if (autoFormatOnBlur && value && parsedValue > 0) {
      // Format cleanly to Brazilian number string (without R$)
      const formatted = parsedValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      onChange(formatted);
    }
  };

  const handleQuickChip = (amount: number) => {
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    onChange(formatted);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <span className="absolute left-3 top-2.5 font-bold text-slate-400 select-none text-xs sm:text-sm">
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-800 bg-white ${className}`}
        />
      </div>

      {/* Live Feedback Preview */}
      {parsedValue > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-md px-2.5 py-1">
          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span className="font-semibold">Valor reconhecido:</span>
          <span className="font-mono font-bold text-emerald-900">{formatCurrencyBRL(parsedValue)}</span>
          {extenso && (
            <span className="text-emerald-700 font-medium">({extenso})</span>
          )}
        </div>
      )}

      {/* Quick Values Buttons */}
      {showQuickChips && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-[10px] text-slate-400 mr-1 select-none">Atalhos rápidos:</span>
          {[
            { label: '50 mil', val: 50000 },
            { label: '100 mil', val: 100000 },
            { label: '250 mil', val: 250000 },
            { label: '400 mil', val: 400000 },
            { label: '500 mil', val: 500000 },
            { label: '1 milhão', val: 1000000 },
          ].map((chip) => (
            <button
              key={chip.val}
              type="button"
              onClick={() => handleQuickChip(chip.val)}
              className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded transition-colors cursor-pointer border border-slate-200/70"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
