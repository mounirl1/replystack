import { Check, Heart, Lightbulb, Phone, FileText, Gift } from 'lucide-react';
import type { NegativeStrategy, NegativeStrategyOption } from '@/types/responseProfile';

interface NegativeStrategyStepProps {
  value: NegativeStrategy;
  onChange: (value: NegativeStrategy) => void;
  strategies: NegativeStrategyOption[];
}

const strategyIcons: Record<NegativeStrategy, React.ReactNode> = {
  empathetic: <Heart size={20} />,
  solution: <Lightbulb size={20} />,
  contact: <Phone size={20} />,
  factual: <FileText size={20} />,
  reconquest: <Gift size={20} />,
};

export function NegativeStrategyStep({
  value,
  onChange,
  strategies,
}: NegativeStrategyStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Comment gérer les avis négatifs ?
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          Choisissez l'approche qui correspond le mieux à votre philosophie.
        </p>
      </div>

      <div className="space-y-3">
        {strategies.map((strategy) => (
          <button
            key={strategy.value}
            type="button"
            onClick={() => onChange(strategy.value)}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all duration-150
              hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover
              ${value === strategy.value
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${value === strategy.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary'
                  }
                `}
              >
                {strategyIcons[strategy.value]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={`
                      font-medium
                      ${value === strategy.value
                        ? 'text-primary-500'
                        : 'text-text-dark-primary dark:text-text-primary'
                      }
                    `}
                  >
                    {strategy.label}
                  </p>
                  {value === strategy.value && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary mt-1">
                  {strategy.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
