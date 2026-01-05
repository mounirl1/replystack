import { Check, AlignLeft, AlignCenter, AlignJustify } from 'lucide-react';
import type { ResponseLength, LengthOption } from '@/types/responseProfile';

interface LengthStepProps {
  value: ResponseLength;
  onChange: (value: ResponseLength) => void;
  lengths: LengthOption[];
}

const lengthIcons: Record<ResponseLength, React.ReactNode> = {
  short: <AlignLeft size={24} />,
  medium: <AlignCenter size={24} />,
  detailed: <AlignJustify size={24} />,
};

export function LengthStep({ value, onChange, lengths }: LengthStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Quelle longueur de réponse préférez-vous ?
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Vous pourrez toujours ajuster au cas par cas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {lengths.map((length) => (
          <button
            key={length.value}
            type="button"
            onClick={() => onChange(length.value)}
            className={`
              relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-150
              hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover
              ${value === length.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
              }
            `}
          >
            {value === length.value && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div
              className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-3
                ${value === length.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary'
                }
              `}
            >
              {lengthIcons[length.value]}
            </div>
            <p
              className={`
                font-semibold
                ${value === length.value
                  ? 'text-primary-500'
                  : 'text-text-dark-primary dark:text-text-primary'
                }
              `}
            >
              {length.label}
            </p>
            <p className="text-sm text-text-dark-secondary dark:text-text-secondary text-center mt-1">
              {length.description}
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              {length.wordRange.min}-{length.wordRange.max} mots
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
