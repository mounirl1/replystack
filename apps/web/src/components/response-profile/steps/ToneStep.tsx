import { Check } from 'lucide-react';
import type { ResponseTone, ToneOption } from '@/types/responseProfile';

interface ToneStepProps {
  value: ResponseTone;
  onChange: (value: ResponseTone) => void;
  tones: ToneOption[];
}

export function ToneStep({ value, onChange, tones }: ToneStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Quel ton souhaitez-vous adopter ?
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Le ton définit la personnalité de vos réponses.
        </p>
      </div>

      <div className="space-y-3">
        {tones.map((tone) => (
          <button
            key={tone.value}
            type="button"
            onClick={() => onChange(tone.value)}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all duration-150
              hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover
              ${value === tone.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${value === tone.value
                    ? 'bg-primary-500 text-white'
                    : 'border-2 border-light-border dark:border-dark-border'
                  }
                `}
              >
                {value === tone.value && <Check size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    font-medium
                    ${value === tone.value
                      ? 'text-primary-500'
                      : 'text-text-dark-primary dark:text-text-primary'
                    }
                  `}
                >
                  {tone.label}
                </p>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary mt-0.5">
                  {tone.description}
                </p>
                <div className="mt-2 p-3 bg-light-hover dark:bg-dark-hover rounded-lg">
                  <p className="text-xs text-text-tertiary mb-1">Exemple :</p>
                  <p className="text-sm text-text-dark-secondary dark:text-text-secondary italic">
                    "{tone.example}"
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
