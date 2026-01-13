import { Textarea } from '@/components/ui/Input';
import { useTranslation } from 'react-i18next';

interface AdvancedStepProps {
  highlights: string;
  avoidTopics: string;
  additionalContext: string;
  onHighlightsChange: (value: string) => void;
  onAvoidTopicsChange: (value: string) => void;
  onAdditionalContextChange: (value: string) => void;
}

export function AdvancedStep({
  highlights,
  avoidTopics,
  additionalContext,
  onHighlightsChange,
  onAvoidTopicsChange,
  onAdditionalContextChange,
}: AdvancedStepProps) {
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          {t('responseStyle.modal.advanced.title')}
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-2">
          {t('responseStyle.modal.advanced.subtitle')}
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Textarea
            label={t('responseStyle.modal.advanced.highlights')}
            value={highlights}
            onChange={(e) => onHighlightsChange(e.target.value)}
            placeholder={t('responseStyle.modal.advanced.highlightsPlaceholder')}
            hint={t('responseStyle.modal.advanced.highlightsHint')}
            rows={3}
          />
        </div>

        <div>
          <Textarea
            label={t('responseStyle.modal.advanced.avoidTopics')}
            value={avoidTopics}
            onChange={(e) => onAvoidTopicsChange(e.target.value)}
            placeholder={t('responseStyle.modal.advanced.avoidTopicsPlaceholder')}
            hint={t('responseStyle.modal.advanced.avoidTopicsHint')}
            rows={3}
          />
        </div>

        <div>
          <Textarea
            label={t('responseStyle.modal.advanced.additionalContext')}
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
            placeholder={t('responseStyle.modal.advanced.additionalContextPlaceholder')}
            hint={t('responseStyle.modal.advanced.additionalContextHint')}
            rows={3}
          />
        </div>
      </div>

      <p className="text-xs text-text-tertiary text-center">
        {t('responseStyle.modal.advanced.optionalNote')}
      </p>
    </div>
  );
}
