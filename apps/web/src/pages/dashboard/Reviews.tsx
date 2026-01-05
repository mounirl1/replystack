import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ReviewStats } from '../../components/reviews/ReviewStats';
import { ReviewFilters } from '../../components/reviews/ReviewFilters';
import { ReviewList } from '../../components/reviews/ReviewList';
import { ReviewDetailModal } from '../../components/reviews/ReviewDetailModal';
import { FetchButton } from '../../components/reviews/FetchButton';
import { locationsApi } from '../../services/api';
import type { Review, ReviewFilters as Filters, Platform, ReviewStatus } from '../../types/review';

interface Location {
  id: number;
  name: string;
  google_place_id?: string | null;
  facebook_page_id?: string | null;
  google_access_token?: string | null;
  facebook_access_token?: string | null;
}

export default function Reviews() {
  const { t } = useTranslation('dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [totalCount, _setTotalCount] = useState<number | undefined>();

  // Parse filters from URL
  const filters: Filters = {
    location_id: searchParams.get('location_id')
      ? Number(searchParams.get('location_id'))
      : undefined,
    platform: searchParams.getAll('platform') as Platform[],
    status: searchParams.getAll('status') as ReviewStatus[],
    rating_min: searchParams.get('rating_min')
      ? Number(searchParams.get('rating_min'))
      : undefined,
    date_from: searchParams.get('date_from') || undefined,
    search: searchParams.get('search') || undefined,
  };

  // Clean up empty arrays
  if (filters.platform?.length === 0) delete filters.platform;
  if (filters.status?.length === 0) delete filters.status;

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
      if (newFilters.rating_min) {
        params.set('rating_min', String(newFilters.rating_min));
      }
      if (newFilters.date_from) {
        params.set('date_from', newFilters.date_from);
      }
      if (newFilters.search) {
        params.set('search', newFilters.search);
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

      {/* Stats */}
      <ReviewStats
        locationId={filters.location_id}
        period={filters.date_from ? '30' : undefined}
      />

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        locations={locations}
        totalCount={totalCount}
      />

      {/* Review List */}
      <ReviewList
        filters={filters}
        onSelectReview={(review) => setSelectedReview(review)}
      />

      {/* Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}
