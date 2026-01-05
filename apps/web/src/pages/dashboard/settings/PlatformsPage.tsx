import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, AlertCircle, Link2 } from 'lucide-react';
import { PlatformConnections } from '../../../components/settings/PlatformConnections';
import { useAuth } from '../../../contexts/AuthContext';
import { locationsApi, type Location } from '../../../services/api';

export function PlatformsPage() {
  const { t } = useTranslation('settings');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const oauthStatus = searchParams.get('oauth_status');
    const oauthPlatform = searchParams.get('oauth_platform');
    const oauthError = searchParams.get('oauth_error');

    if (oauthStatus) {
      if (oauthStatus === 'success') {
        setToast({
          type: 'success',
          message: t('platforms.oauthSuccess', { platform: oauthPlatform }),
        });
      } else if (oauthStatus === 'error') {
        setToast({
          type: 'error',
          message: oauthError || t('platforms.oauthError'),
        });
      }

      // Clear params
      searchParams.delete('oauth_status');
      searchParams.delete('oauth_platform');
      searchParams.delete('oauth_error');
      setSearchParams(searchParams, { replace: true });

      // Auto-dismiss toast
      setTimeout(() => setToast(null), 5000);
    }
  }, [searchParams, setSearchParams, t]);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsApi.getAll();
        setLocations(response.locations);
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span
            className={
              toast.type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }
          >
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-tertiary hover:text-secondary"
          >
            &times;
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="w-40 h-5 rounded skeleton" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 rounded-xl skeleton" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center">
          <Link2 className="w-12 h-12 text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-primary dark:text-primary mb-2">
            {t('platforms.noLocations')}
          </h3>
          <p className="text-sm text-tertiary dark:text-dark-tertiary mb-4">
            {t('platforms.noLocationsDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {locations.map((location) => (
            <PlatformConnections
              key={location.id}
              location={location}
              userPlan={user?.plan || 'free'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
