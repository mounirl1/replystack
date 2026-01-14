import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Sparkles, Lock, Check } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { userApi, type AIProvidersResponse } from '@/services/api';
import { SUCCESS_TOAST_DURATION } from '@/constants';

interface AIProviderSettingsProps {
  hasPaidPlan: boolean;
}

export function AIProviderSettings({ hasPaidPlan }: AIProviderSettingsProps) {
  const { t } = useTranslation('settings');
  const [providers, setProviders] = useState<AIProvidersResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.getAiProviders();
      setProviders(data);
      setSelectedProvider(data.current_provider);
    } catch (err) {
      console.error('Failed to load AI providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderChange = async (provider: string) => {
    if (!hasPaidPlan || provider === selectedProvider) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await userApi.updateAiProvider(provider as 'gemini' | 'mistral');
      setSelectedProvider(provider);
      setSuccessMessage(t('aiProvider.saved'));
      setTimeout(() => setSuccessMessage(''), SUCCESS_TOAST_DURATION);
    } catch (err) {
      setErrorMessage(t('aiProvider.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-light-border dark:bg-dark-border rounded mb-2" />
          <div className="h-4 w-48 bg-light-border dark:bg-dark-border rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('aiProvider.title')}
        description={t('aiProvider.description')}
      />

      {successMessage && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
          <Check size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {providers && Object.entries(providers.available_providers).map(([key, provider]) => {
          const isSelected = selectedProvider === key;
          const isAvailable = provider.available;
          const isDisabled = !isAvailable || isSaving;

          return (
            <button
              key={key}
              onClick={() => handleProviderChange(key)}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                ${isSelected
                  ? 'border-primary-500 bg-primary-500/10'
                  : isAvailable
                    ? 'border-light-border dark:border-dark-border hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover'
                    : 'border-light-border dark:border-dark-border opacity-60 cursor-not-allowed'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${isSelected ? 'bg-primary-500' : 'bg-light-hover dark:bg-dark-hover'}
              `}>
                {key === 'gemini' ? (
                  <Sparkles size={20} className={isSelected ? 'text-white' : 'text-text-tertiary'} />
                ) : (
                  <Bot size={20} className={isSelected ? 'text-white' : 'text-text-tertiary'} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-dark-primary dark:text-text-primary">
                    {t(`aiProvider.providers.${key}.name`)}
                  </span>
                  {isSelected && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500 text-white">
                      {t('aiProvider.current')}
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      <Lock size={12} />
                      {t('aiProvider.paidOnly')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary mt-0.5">
                  {t(`aiProvider.providers.${key}.description`)}
                </p>
              </div>

              {isSelected && (
                <Check size={20} className="text-primary-500" />
              )}
            </button>
          );
        })}
      </div>

      {!hasPaidPlan && (
        <div className="mt-4 p-4 bg-light-hover dark:bg-dark-hover rounded-xl">
          <p className="text-sm text-text-dark-secondary dark:text-text-secondary">
            {t('aiProvider.upgradeMessage')}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => window.location.href = '/pricing'}
          >
            {t('aiProvider.viewPlans')}
          </Button>
        </div>
      )}
    </Card>
  );
}
