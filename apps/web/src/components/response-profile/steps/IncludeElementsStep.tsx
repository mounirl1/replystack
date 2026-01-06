import { User, Building2, Smile, RotateCcw, PenLine, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { IncludeElementsBySentiment, SentimentType } from '@/types/responseProfile';

interface IncludeElementsStepProps {
  value: IncludeElementsBySentiment;
  onChange: (value: IncludeElementsBySentiment) => void;
}

interface ElementConfig {
  key: keyof IncludeElementsBySentiment['negative'];
  icon: LucideIcon;
  labelKey: string;
}

interface SentimentConfig {
  key: SentimentType;
  emoji: string;
  labelKey: string;
  colorClass: string;
}

const ELEMENTS: ElementConfig[] = [
  { key: 'customer_name', icon: User, labelKey: 'responseStyle.includeElements.customerName' },
  { key: 'business_name', icon: Building2, labelKey: 'responseStyle.includeElements.businessName' },
  { key: 'emojis', icon: Smile, labelKey: 'responseStyle.includeElements.emojis' },
  { key: 'invitation', icon: RotateCcw, labelKey: 'responseStyle.includeElements.invitation' },
  { key: 'signature', icon: PenLine, labelKey: 'responseStyle.includeElements.signature' },
];

const SENTIMENTS: SentimentConfig[] = [
  { key: 'negative', emoji: '😞', labelKey: 'responseStyle.sentiment.negative', colorClass: 'text-red-600 dark:text-red-400' },
  { key: 'neutral', emoji: '😐', labelKey: 'responseStyle.sentiment.neutral', colorClass: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'positive', emoji: '😊', labelKey: 'responseStyle.sentiment.positive', colorClass: 'text-green-600 dark:text-green-400' },
];

export function IncludeElementsStep({ value, onChange }: IncludeElementsStepProps) {
  const { t } = useTranslation('settings');

  const handleToggle = (element: keyof IncludeElementsBySentiment['negative'], sentiment: SentimentType) => {
    onChange({
      ...value,
      [sentiment]: {
        ...value[sentiment],
        [element]: !value[sentiment][element],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          {t('responseStyle.includeElements.title')}
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          {t('responseStyle.includeElements.description')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 pr-4 text-sm font-medium text-text-dark-secondary dark:text-text-secondary">
                {t('responseStyle.includeElements.element')}
              </th>
              {SENTIMENTS.map((sentiment) => (
                <th
                  key={sentiment.key}
                  className="text-center py-3 px-2 text-sm font-medium"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{sentiment.emoji}</span>
                    <span className={sentiment.colorClass}>
                      {t(sentiment.labelKey)}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ELEMENTS.map((element) => {
              const Icon = element.icon;
              return (
                <tr
                  key={element.key}
                  className="border-t border-light-border dark:border-dark-border"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-light-hover dark:bg-dark-hover flex items-center justify-center text-text-dark-secondary dark:text-text-secondary">
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-text-dark-primary dark:text-text-primary">
                        {t(element.labelKey)}
                      </span>
                    </div>
                  </td>
                  {SENTIMENTS.map((sentiment) => (
                    <td key={sentiment.key} className="text-center py-4 px-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(element.key, sentiment.key)}
                        className={`
                          w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all duration-150
                          ${value[sentiment.key][element.key]
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'border-light-border dark:border-dark-border hover:border-primary-400'
                          }
                        `}
                        aria-label={`${t(element.labelKey)} - ${t(sentiment.labelKey)}`}
                      >
                        {value[sentiment.key][element.key] && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <span className="flex-shrink-0">💡</span>
          <span>{t('responseStyle.includeElements.tip')}</span>
        </p>
      </div>

      <p className="text-xs text-text-tertiary text-center">
        {t('responseStyle.includeElements.optional')}
      </p>
    </div>
  );
}
