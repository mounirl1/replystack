import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Zap, Check, ArrowRight } from 'lucide-react';

interface AutoExtractionStatusProps {
  userPlan: string;
}

export function AutoExtractionStatus({ userPlan }: AutoExtractionStatusProps) {
  const { t } = useTranslation('settings');

  const isPaidPlan = userPlan !== 'free';

  if (isPaidPlan) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">
                {t('platforms.autoExtraction.title')}
              </h4>
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full">
                <Check className="w-3 h-3" />
                {t('platforms.autoExtraction.enabled')}
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t('platforms.autoExtraction.description')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-dark-primary dark:text-primary">
            {t('platforms.autoExtraction.title')}
          </h4>
          <p className="text-sm text-secondary dark:text-dark-secondary mt-1">
            {t('platforms.autoExtraction.upgradeMessage')}
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {t('platforms.autoExtraction.viewPlans')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
