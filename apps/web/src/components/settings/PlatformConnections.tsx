import { useTranslation } from 'react-i18next';
import { MapPin, RefreshCw, Wifi, AlertTriangle } from 'lucide-react';
import { ApiPlatformCard } from './ApiPlatformCard';
import { ExtensionPlatformCard } from './ExtensionPlatformCard';
import { AutoExtractionStatus } from './AutoExtractionStatus';
import { useLocationConnections, useUpdateManagementUrls } from '../../hooks/useLocationConnections';
import type { LocationConnections as LocationConnectionsType } from '../../services/connections';

interface Location {
  id: number;
  name: string;
  address?: string | null;
}

interface PlatformConnectionsProps {
  location: Location;
  userPlan: string;
}

// Default empty connections when API fails
const defaultConnections: LocationConnectionsType = {
  google: { connected: false },
  facebook: { connected: false },
  tripadvisor: { connected: false },
  booking: { connected: false },
  yelp: { connected: false },
};

export function PlatformConnections({ location, userPlan }: PlatformConnectionsProps) {
  const { t } = useTranslation('settings');
  const { data: connections, isLoading, isError, refetch } = useLocationConnections(location.id);
  const updateUrlsMutation = useUpdateManagementUrls();

  // Use default connections if API fails
  const platformData = connections || defaultConnections;

  const handleUrlChange = (platform: 'tripadvisor' | 'booking' | 'yelp', url: string | null) => {
    updateUrlsMutation.mutate({
      locationId: location.id,
      urls: { [platform]: url },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="w-40 h-5 rounded skeleton" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
      {/* Location Header */}
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-primary dark:text-primary">
              {location.name}
            </h3>
            {location.address && (
              <p className="text-sm text-tertiary dark:text-dark-tertiary">
                {location.address}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Banner */}
        {isError && (
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-800 dark:text-amber-200 flex-1">
              {t('platforms.loadError')}
            </span>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('platforms.retry')}
            </button>
          </div>
        )}

        {/* API Platforms Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-semibold text-dark-primary dark:text-primary uppercase tracking-wide">
              {t('platforms.apiSection')}
            </h4>
          </div>
          <p className="text-sm text-tertiary dark:text-dark-tertiary mb-4">
            {t('platforms.apiSectionDescription')}
          </p>
          <div className="space-y-3">
            <ApiPlatformCard
              platform="google"
              locationId={location.id}
              connection={platformData.google}
            />
            <ApiPlatformCard
              platform="facebook"
              locationId={location.id}
              connection={platformData.facebook}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-light-border dark:border-dark-border" />

        {/* Extension Platforms Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-primary-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.59L16 11l-6 6z" />
            </svg>
            <h4 className="text-sm font-semibold text-dark-primary dark:text-primary uppercase tracking-wide">
              {t('platforms.extensionSection')}
            </h4>
          </div>

          {/* Auto Extraction Status */}
          <div className="mb-4">
            <AutoExtractionStatus userPlan={userPlan} />
          </div>

          <div className="space-y-3">
            <ExtensionPlatformCard
              platform="tripadvisor"
              locationId={location.id}
              connection={platformData.tripadvisor}
              onUrlChange={(url) => handleUrlChange('tripadvisor', url)}
              isUpdating={updateUrlsMutation.isPending}
            />
            <ExtensionPlatformCard
              platform="booking"
              locationId={location.id}
              connection={platformData.booking}
              onUrlChange={(url) => handleUrlChange('booking', url)}
              isUpdating={updateUrlsMutation.isPending}
            />
            <ExtensionPlatformCard
              platform="yelp"
              locationId={location.id}
              connection={platformData.yelp}
              onUrlChange={(url) => handleUrlChange('yelp', url)}
              isUpdating={updateUrlsMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
