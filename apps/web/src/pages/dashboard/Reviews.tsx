import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ReviewSidebar } from '../../components/reviews/ReviewSidebar';
import { ReviewFilters } from '../../components/reviews/ReviewFilters';
import { ReviewList } from '../../components/reviews/ReviewList';
import { ReviewDetailModal } from '../../components/reviews/ReviewDetailModal';
import { FetchButton } from '../../components/reviews/FetchButton';
import { locationsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Review, ReviewFilters as Filters, Platform, ReviewStatus, ContentFilter } from '../../types/review';

interface Location {
  id: number;
  name: string;
  google_place_id?: string | null;
  facebook_page_id?: string | null;
  has_google_connection?: boolean;
  has_facebook_connection?: boolean;
}

export default function Reviews() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [totalCount, _setTotalCount] = useState<number | undefined>();

  // Parse filters from URL
  const hasContentParam = searchParams.get('has_content') as ContentFilter | null;
  const filters: Filters = {
    location_id: searchParams.get('location_id')
      ? Number(searchParams.get('location_id'))
      : undefined,
    platform: searchParams.getAll('platform') as Platform[],
    status: searchParams.getAll('status') as ReviewStatus[],
    ratings: searchParams.getAll('rating').map(Number).filter(r => r >= 1 && r <= 5),
    date_from: searchParams.get('date_from') || undefined,
    search: searchParams.get('search') || undefined,
    has_content: hasContentParam && ['with_text', 'without_text'].includes(hasContentParam)
      ? hasContentParam
      : undefined,
  };

  // Clean up empty arrays
  if (filters.platform?.length === 0) delete filters.platform;
  if (filters.status?.length === 0) delete filters.status;
  if (filters.ratings?.length === 0) delete filters.ratings;

  // Update URL when filters change
  const handleFiltersChange = useCallback(
    (newFilters: Filters) => {
      const params = new URLSearchParams();

      if (newFilters.location_id) {
        params.set('location_id', String(newFilters.location_id));
      }
      if (newFilters.platform?.length) {
        newFilters.platform.forEach((p) => params.append('platform', p));
      }
      if (newFilters.status?.length) {
        newFilters.status.forEach((s) => params.append('status', s));
      }
      if (newFilters.ratings?.length) {
        newFilters.ratings.forEach((r) => params.append('rating', String(r)));
      }
      if (newFilters.date_from) {
        params.set('date_from', newFilters.date_from);
      }
      if (newFilters.search) {
        params.set('search', newFilters.search);
      }
      if (newFilters.has_content) {
        params.set('has_content', newFilters.has_content);
      }

      setSearchParams(params);
    },
    [setSearchParams]
  );

  // Load locations
  useEffect(() => {
    locationsApi.getAll().then((response) => {
      setLocations(response.locations || []);
    });
  }, []);

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-primary dark:text-primary">
            {t('reviews.title')}
          </h1>
          <p className="text-sm text-tertiary dark:text-dark-tertiary mt-1">
            {t('reviews.subtitle')}
          </p>
        </div>
        <FetchButton locations={locations} />
      </div>

      {/* 2-column layout on desktop */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left sidebar - sticky on desktop */}
        <aside className="w-full lg:w-[380px] lg:flex-shrink-0 lg:overflow-y-auto lg:pr-2 lg:-mr-2">
          <ReviewSidebar
            locationId={filters.location_id}
            period={filters.date_from ? '30' : undefined}
            filters={filters}
            userQuota={user?.quota_remaining ?? 0}
          />
        </aside>

        {/* Right column - main content */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Filters - Fixed within main */}
          <div className="flex-shrink-0 mb-4">
            <ReviewFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              locations={locations}
              totalCount={totalCount}
            />
          </div>

          {/* Review List - with fixed pagination */}
          <div className="flex-1 min-h-0">
            <ReviewList
              filters={filters}
              onSelectReview={(review) => setSelectedReview(review)}
            />
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}
