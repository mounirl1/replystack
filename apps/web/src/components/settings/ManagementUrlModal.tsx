import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import { isValidManagementUrl, PLATFORM_URL_EXAMPLES } from '../../services/connections';

interface ManagementUrlModalProps {
  platform: string;
  currentUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}

const PLATFORM_INSTRUCTIONS: Record<string, string[]> = {
  tripadvisor: [
    'Go to TripAdvisor.com and log in',
    'Click on your business profile',
    'Navigate to Management Center',
    'Copy the URL from your browser',
  ],
  booking: [
    'Go to admin.booking.com and log in',
    'Select your property',
    'Navigate to Reviews section',
    'Copy the URL from your browser',
  ],
  yelp: [
    'Go to biz.yelp.com and log in',
    'Select your business',
    'Navigate to Reviews page',
    'Copy the URL from your browser',
  ],
};

export function ManagementUrlModal({
  platform,
  currentUrl,
  isOpen,
  onClose,
  onSave,
}: ManagementUrlModalProps) {
  const { t } = useTranslation('settings');
  const [url, setUrl] = useState(currentUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isTested, setIsTested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl || '');
      setError(null);
      setIsTested(false);
    }
  }, [isOpen, currentUrl]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    setIsTested(false);
  };

  const validateUrl = (): boolean => {
    if (!url.trim()) {
      setError(null);
      return true; // Empty is valid (clears the URL)
    }

    if (!isValidManagementUrl(platform, url)) {
      setError(t('platforms.urlModal.invalidUrl', { domain: PLATFORM_URL_EXAMPLES[platform]?.split('/')[2] || platform }));
      return false;
    }

    return true;
  };

  const handleTest = () => {
    if (!validateUrl()) return;
    if (url.trim()) {
      window.open(url, '_blank');
      setIsTested(true);
    }
  };

  const handleSave = () => {
    if (!validateUrl()) return;
    onSave(url.trim());
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setIsTested(false);
    onSave('');
  };

  if (!isOpen) return null;

  const instructions = PLATFORM_INSTRUCTIONS[platform] || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={platform} size="md" />
            <h2 className="text-lg font-semibold text-dark-primary dark:text-primary">
              {t('platforms.urlModal.title', { platform: getPlatformName(platform) })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4">
            <h3 className="text-sm font-medium text-dark-primary dark:text-primary mb-3">
              {t('platforms.urlModal.instructions')}
            </h3>
            <ol className="space-y-2">
              {instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-secondary dark:text-dark-secondary"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-dark-primary dark:text-primary mb-2">
              {t('platforms.urlModal.urlLabel')}
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={PLATFORM_URL_EXAMPLES[platform]}
                className={`w-full px-4 py-2.5 text-sm bg-light-bg dark:bg-dark-bg border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-500 focus:ring-red-500/20'
                    : isTested
                    ? 'border-green-500 focus:ring-green-500/20'
                    : 'border-light-border dark:border-dark-border focus:ring-primary-500/20'
                }`}
              />
              {isTested && !error && url && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50">
          <div className="flex items-center gap-2">
            {currentUrl && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                {t('platforms.urlModal.remove')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {url.trim() && (
              <button
                onClick={handleTest}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('platforms.urlModal.test')}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-tertiary hover:text-secondary transition-colors"
            >
              {t('platforms.urlModal.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!!error}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('platforms.urlModal.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
