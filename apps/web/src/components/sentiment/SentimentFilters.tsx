import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import type { SentimentFilters as Filters } from '../../types/sentiment';

interface Location {
  id: number;
  name: string;
}

interface SentimentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  locations?: Location[];
}

type Platform = 'google' | 'tripadvisor' | 'booking' | 'yelp' | 'facebook' | 'airbnb';

const PLATFORMS: Platform[] = ['google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'airbnb'];

const PERIODS = [
  { value: '7', labelKey: '7days' },
  { value: '30', labelKey: '30days' },
  { value: '90', labelKey: '90days' },
  { value: '', labelKey: 'Alltime' },
];

export function SentimentFilters({
  filters,
  onFiltersChange,
  locations = [],
}: SentimentFiltersProps) {
  const { t } = useTranslation('dashboard');

  const togglePlatform = (platform: string) => {
    const current = filters.platform || [];
    const newPlatforms = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    onFiltersChange({
      ...filters,
      platform: newPlatforms.length > 0 ? newPlatforms : undefined,
    });
  };

  const setPeriod = (days: string) => {
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      onFiltersChange({
        ...filters,
        date_from: date.toISOString().split('T')[0],
        date_to: undefined,
      });
    } else {
      onFiltersChange({
        ...filters,
        date_from: undefined,
        date_to: undefined,
      });
    }
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.platform?.length ||
    filters.date_from ||
    filters.location_id;

  // Calculate current period value
  const getCurrentPeriod = () => {
    if (!filters.date_from) return '';
    const daysDiff = Math.round(
      (Date.now() - new Date(filters.date_from).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 8) return '7';
    if (daysDiff <= 31) return '30';
    if (daysDiff <= 91) return '90';
    return '';
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 space-y-4">
      {/* Top row: Location + Period + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location selector */}
        {locations.length > 1 && (
          <select
            value={filters.location_id || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                location_id: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="px-3 py-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 min-w-[150px]"
          >
            <option value="">{t('reviews.filters.allLocations')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}

        {/* Period selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-tertiary" />
          <div className="flex gap-1 p-1 bg-light-bg dark:bg-dark-bg rounded-lg">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setPeriod(period.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currentPeriod === period.value
                    ? 'bg-white dark:bg-dark-surface text-primary-600 shadow-sm'
                    : 'text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary'
                }`}
              >
                {t(`reviews.filters.periods.${period.labelKey}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            {t('reviews.filters.reset')}
          </button>
        )}
      </div>

      {/* Platforms row */}
      <div>
        <label className="block text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wider">
          {t('reviews.filters.platforms')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => {
            const isActive = filters.platform?.includes(platform);
            return (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700 text-text-dark-secondary dark:text-text-secondary'
                }`}
              >
                <PlatformIcon platform={platform} size="sm" />
                <span>{getPlatformName(platform)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
