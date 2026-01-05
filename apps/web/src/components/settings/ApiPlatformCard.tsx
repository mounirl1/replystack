import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import { getOAuthUrl } from '../../services/connections';
import { useDisconnectPlatform } from '../../hooks/useLocationConnections';
import type { PlatformConnection } from '../../services/connections';

interface ApiPlatformCardProps {
  platform: 'google' | 'facebook';
  locationId: number;
  connection: PlatformConnection;
}

export function ApiPlatformCard({ platform, locationId, connection }: ApiPlatformCardProps) {
  const { t } = useTranslation('settings');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const disconnectMutation = useDisconnectPlatform();

  const handleConnect = () => {
    const url = getOAuthUrl(platform, locationId);
    window.location.href = url;
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate(
      { locationId, platform },
      {
        onSuccess: () => {
          setShowDisconnectConfirm(false);
        },
      }
    );
  };

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

  const isTokenExpired = connection.connected && connection.token_valid === false;

  return (
    <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4 border border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={platform} size="lg" />
          <div>
            <h4 className="font-medium text-dark-primary dark:text-primary">
              {getPlatformName(platform)}
            </h4>
            {connection.connected ? (
              <div className="flex items-center gap-2 mt-0.5">
                {isTokenExpired ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {t('platforms.tokenExpired')}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {t('platforms.connected')}
                    </span>
                    {connection.last_fetch_at && (
                      <span className="text-xs text-tertiary dark:text-dark-tertiary">
                        • {t('platforms.lastSync')}: {formatLastSync(connection.last_fetch_at)}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <span className="text-xs text-tertiary dark:text-dark-tertiary">
                {t('platforms.notConnected')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connection.connected ? (
            isTokenExpired ? (
              <button
                onClick={handleConnect}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('platforms.reconnect')}
              </button>
            ) : showDisconnectConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                  {disconnectMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    t('platforms.confirmDisconnect')
                  )}
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-tertiary hover:text-secondary rounded-lg transition-colors"
                >
                  {t('platforms.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="px-3 py-1.5 text-sm font-medium text-tertiary hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
              >
                {t('platforms.disconnect')}
              </button>
            )
          ) : (
            <button
              onClick={handleConnect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('platforms.connect')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
