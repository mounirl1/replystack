import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useReviewStats } from '../../hooks/useReviews';
import { RatingDistribution } from './RatingDistribution';
import { AISummaryCard } from './AISummaryCard';
import type { ReviewFilters } from '../../types/review';

interface ReviewSidebarProps {
  locationId?: number;
  period?: string;
  filters: ReviewFilters;
  userQuota: number | 'unlimited';
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor: string;
  warning?: boolean;
}

function StatItem({ icon, label, value, iconColor, warning }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
      <div className={`p-2 rounded-lg ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-tertiary dark:text-dark-tertiary truncate">{label}</p>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-dark-primary dark:text-primary">
            {value}
          </span>
          {warning && <span className="text-amber-500 text-sm">!</span>}
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats card skeleton */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
        <div className="h-5 w-32 rounded skeleton mb-4" />
        {/* Average rating */}
        <div className="text-center py-6 bg-light-bg dark:bg-dark-bg rounded-xl mb-4">
          <div className="h-12 w-16 rounded skeleton mx-auto mb-2" />
          <div className="h-4 w-24 rounded skeleton mx-auto" />
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg skeleton" />
                <div className="flex-1">
                  <div className="h-3 w-16 rounded skeleton mb-1" />
                  <div className="h-5 w-10 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewSidebar({ locationId, period, filters, userQuota }: ReviewSidebarProps) {
  const { t } = useTranslation('dashboard');
  const { data: stats, isLoading } = useReviewStats({
    location_id: locationId,
    period,
  });

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  // Calculate recent reviews from trend data (last 30 days)
  const recentCount = stats?.trend?.reduce((sum, day) => sum + day.count, 0) || 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Stats Card */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
        <h3 className="font-semibold text-dark-primary dark:text-primary mb-4">
          {t('reviews.sidebar.overview')}
        </h3>

        {/* Average Rating - Featured */}
        <div className="text-center py-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl mb-4 border border-yellow-100 dark:border-yellow-900/30">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-4xl font-bold text-dark-primary dark:text-primary">
              {stats?.average_rating?.toFixed(1) || '-'}
            </span>
            <span className="text-lg text-tertiary dark:text-dark-tertiary">/5</span>
          </div>
          <p className="text-sm text-tertiary dark:text-dark-tertiary">
            {t('reviews.sidebar.averageRating')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            icon={<MessageSquare className="w-4 h-4" />}
            label={t('reviews.stats.total')}
            value={stats?.total ?? 0}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatItem
            icon={<CheckCircle className="w-4 h-4" />}
            label={t('reviews.stats.responseRate')}
            value={`${stats?.response_rate ?? 0}%`}
            iconColor={
              (stats?.response_rate ?? 0) >= 80
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }
          />
          <StatItem
            icon={<Clock className="w-4 h-4" />}
            label={t('reviews.stats.pending')}
            value={stats?.pending ?? 0}
            iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            warning={(stats?.pending ?? 0) > 0}
          />
          <StatItem
            icon={<TrendingUp className="w-4 h-4" />}
            label={t('reviews.sidebar.recent30days')}
            value={recentCount}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
        </div>
      </div>

      {/* Rating Distribution */}
      <RatingDistribution
        byRating={stats?.by_rating}
        total={stats?.total}
        isLoading={isLoading}
      />

      {/* AI Summary */}
      <AISummaryCard
        filters={filters}
        reviewCount={stats?.total ?? 0}
        userQuota={userQuota}
      />
    </div>
  );
}
