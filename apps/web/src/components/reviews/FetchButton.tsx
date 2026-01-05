import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ChevronDown, Check, Info } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import { useTriggerFetch } from '../../hooks/useReviews';
import type { Platform } from '../../types/review';

interface Location {
  id: number;
  name: string;
  google_place_id?: string | null;
  facebook_page_id?: string | null;
  google_access_token?: string | null;
  facebook_access_token?: string | null;
}

interface FetchButtonProps {
  locations: Location[];
}

interface PlatformStatus {
  platform: Platform;
  connected: boolean;
  locationId?: number;
}

export function FetchButton({ locations }: FetchButtonProps) {
  const { t } = useTranslation('dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [fetchingPlatform, setFetchingPlatform] = useState<string | null>(null);
  const [fetchedPlatforms, setFetchedPlatforms] = useState<string[]>([]);

  const triggerFetch = useTriggerFetch();

  // Determine which platforms are connected
  const getConnectedPlatforms = (): PlatformStatus[] => {
    const platforms: PlatformStatus[] = [];

    for (const loc of locations) {
      // Google
      if (loc.google_place_id && loc.google_access_token) {
        const existing = platforms.find((p) => p.platform === 'google');
        if (!existing) {
          platforms.push({
            platform: 'google',
            connected: true,
            locationId: loc.id,
          });
        }
      }

      // Facebook
      if (loc.facebook_page_id && loc.facebook_access_token) {
        const existing = platforms.find((p) => p.platform === 'facebook');
        if (!existing) {
          platforms.push({
            platform: 'facebook',
            connected: true,
            locationId: loc.id,
          });
        }
      }
    }

    // Add non-API platforms
    const nonApiPlatforms: Platform[] = ['tripadvisor', 'booking', 'yelp'];
    for (const platform of nonApiPlatforms) {
      platforms.push({ platform, connected: false });
    }

    return platforms;
  };

  const connectedPlatforms = getConnectedPlatforms();
  const hasConnectedPlatforms = connectedPlatforms.some((p) => p.connected);

  const handleFetch = async (platform: Platform, locationId?: number) => {
    if (!locationId) return;

    setFetchingPlatform(platform);
    try {
      await triggerFetch.mutateAsync({ locationId, platform });
      setFetchedPlatforms((prev) => [...prev, platform]);
      setTimeout(() => {
        setFetchedPlatforms((prev) => prev.filter((p) => p !== platform));
      }, 3000);
    } catch (error) {
      console.error('Failed to trigger fetch:', error);
    } finally {
      setFetchingPlatform(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasConnectedPlatforms}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-4 h-4" />
        {t('reviews.fetch.button')}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
              <h3 className="text-sm font-semibold text-dark-primary dark:text-primary">
                {t('reviews.fetch.title')}
              </h3>
              <p className="text-xs text-tertiary dark:text-dark-tertiary mt-1">
                {t('reviews.fetch.description')}
              </p>
            </div>

            <div className="py-2">
              {connectedPlatforms.map(({ platform, connected, locationId }) => {
                const isFetching = fetchingPlatform === platform;
                const isFetched = fetchedPlatforms.includes(platform);

                return (
                  <button
                    key={platform}
                    onClick={() => connected && handleFetch(platform, locationId)}
                    disabled={!connected || isFetching}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      connected
                        ? 'hover:bg-light-hover dark:hover:bg-dark-hover'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <PlatformIcon platform={platform} size="md" />
                    <span
                      className={`flex-1 text-left ${
                        connected
                          ? 'text-dark-primary dark:text-primary'
                          : 'text-tertiary'
                      }`}
                    >
                      {getPlatformName(platform)}
                    </span>
                    {connected ? (
                      isFetching ? (
                        <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />
                      ) : isFetched ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          {t('reviews.fetch.connected')}
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-tertiary bg-light-hover dark:bg-dark-hover px-2 py-0.5 rounded flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {t('reviews.fetch.useExtension')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {!hasConnectedPlatforms && (
              <div className="px-4 py-3 border-t border-light-border dark:border-dark-border bg-amber-50 dark:bg-amber-900/20">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t('reviews.fetch.noConnections')}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
