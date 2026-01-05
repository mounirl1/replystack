import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Settings2 } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import { ManagementUrlModal } from './ManagementUrlModal';
import type { PlatformConnection } from '../../services/connections';

interface ExtensionPlatformCardProps {
  platform: 'tripadvisor' | 'booking' | 'yelp';
  locationId: number;
  connection: PlatformConnection;
  onUrlChange: (url: string | null) => void;
  isUpdating?: boolean;
}

export function ExtensionPlatformCard({
  platform,
  locationId: _locationId,
  connection,
  onUrlChange,
  isUpdating,
}: ExtensionPlatformCardProps) {
  void _locationId; // Reserved for future use
  const { t } = useTranslation('settings');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return t('platforms.justNow');
    if (diffHours < 24) return t('platforms.hoursAgo', { count: diffHours });
    return t('platforms.daysAgo', { count: diffDays });
  };

  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const handleSave = (url: string) => {
    onUrlChange(url || null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4 border border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={platform} size="lg" />
            <div>
              <h4 className="font-medium text-dark-primary dark:text-primary">
                {getPlatformName(platform)}
              </h4>
              {connection.connected && connection.management_url ? (
                <div className="flex flex-col gap-0.5 mt-0.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {t('platforms.urlConfigured')}
                    </span>
                    {connection.last_extension_fetch_at && (
                      <span className="text-xs text-tertiary dark:text-dark-tertiary">
                        • {t('platforms.lastSync')}: {formatLastSync(connection.last_extension_fetch_at)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-tertiary dark:text-dark-tertiary font-mono">
                    {truncateUrl(connection.management_url)}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-tertiary dark:text-dark-tertiary">
                  {t('platforms.notConfigured')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isUpdating}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              connection.connected
                ? 'text-tertiary hover:text-secondary hover:bg-light-hover dark:hover:bg-dark-hover'
                : 'text-white bg-primary-500 hover:bg-primary-600'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            {connection.connected ? t('platforms.modify') : t('platforms.configure')}
          </button>
        </div>
      </div>

      <ManagementUrlModal
        platform={platform}
        currentUrl={connection.management_url}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
