import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import type { ReviewFilters as Filters, Platform, ReviewStatus } from '../../types/review';

interface Location {
  id: number;
  name: string;
}

interface ReviewFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  locations?: Location[];
  totalCount?: number;
}

const PLATFORMS: Platform[] = ['google', 'tripadvisor', 'booking', 'yelp', 'facebook'];
const STATUSES: ReviewStatus[] = ['pending', 'replied', 'ignored'];
const PERIODS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '', label: 'All time' },
];

export function ReviewFilters({
  filters,
  onFiltersChange,
  locations = [],
  totalCount,
}: ReviewFiltersProps) {
  const { t } = useTranslation('dashboard');
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const togglePlatform = useCallback(
    (platform: Platform) => {
      const current = filters.platform || [];
      const newPlatforms = current.includes(platform)
        ? current.filter((p) => p !== platform)
        : [...current, platform];
      onFiltersChange({
        ...filters,
        platform: newPlatforms.length > 0 ? newPlatforms : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const setStatus = useCallback(
    (status: ReviewStatus | null) => {
      onFiltersChange({
        ...filters,
        status: status ? [status] : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const setRatingMin = useCallback(
    (rating: number | null) => {
      onFiltersChange({
        ...filters,
        rating_min: rating || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const resetFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.platform?.length ||
    filters.status?.length ||
    filters.rating_min ||
    filters.search ||
    filters.location_id;

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 mb-6">
      {/* Main row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
          <input
            type="text"
            placeholder={t('reviews.filters.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location selector (if multiple) */}
        {locations.length > 1 && (
          <select
            value={filters.location_id || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                location_id: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="px-3 py-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">{t('reviews.filters.allLocations')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}

        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-dark-primary dark:hover:text-primary border border-light-border dark:border-dark-border rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          {t('reviews.filters.moreFilters')}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
          >
            {t('reviews.filters.reset')}
          </button>
        )}

        {/* Results count */}
        {totalCount !== undefined && (
          <span className="text-sm text-tertiary dark:text-dark-tertiary ml-auto">
            {t('reviews.filters.resultsCount', { count: totalCount })}
          </span>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border space-y-4">
          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-dark-secondary mb-2">
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
                        : 'border-light-border dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <PlatformIcon platform={platform} size="sm" />
                    <span>{getPlatformName(platform)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-dark-secondary mb-2">
              {t('reviews.filters.status')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatus(null)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  !filters.status?.length
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'border-light-border dark:border-dark-border hover:border-primary-300'
                }`}
              >
                {t('reviews.filters.allStatuses')}
              </button>
              {STATUSES.map((status) => {
                const isActive = filters.status?.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => setStatus(status)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'border-light-border dark:border-dark-border hover:border-primary-300'
                    }`}
                  >
                    {t(`reviews.status.${status}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-dark-secondary mb-2">
              {t('reviews.filters.minRating')}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    setRatingMin(filters.rating_min === rating ? null : rating)
                  }
                  className={`p-2 rounded-lg border transition-all ${
                    filters.rating_min && filters.rating_min <= rating
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 text-yellow-500'
                      : 'border-light-border dark:border-dark-border hover:border-yellow-300 text-gray-300 dark:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {filters.rating_min && (
                <span className="flex items-center ml-2 text-sm text-tertiary">
                  {t('reviews.filters.andAbove', { rating: filters.rating_min })}
                </span>
              )}
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-secondary dark:text-dark-secondary mb-2">
              {t('reviews.filters.period')}
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((period) => {
                const currentPeriod = filters.date_from
                  ? Math.round(
                      (Date.now() - new Date(filters.date_from).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ).toString()
                  : '';
                const isActive = currentPeriod === period.value;
                return (
                  <button
                    key={period.value}
                    onClick={() => {
                      if (period.value) {
                        const date = new Date();
                        date.setDate(date.getDate() - parseInt(period.value));
                        onFiltersChange({
                          ...filters,
                          date_from: date.toISOString().split('T')[0],
                        });
                      } else {
                        onFiltersChange({
                          ...filters,
                          date_from: undefined,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'border-light-border dark:border-dark-border hover:border-primary-300'
                    }`}
                  >
                    {t(`reviews.filters.periods.${period.label.replace(' ', '')}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
