import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, Star, CheckCircle } from 'lucide-react';
import { useReviewStats } from '../../hooks/useReviews';

interface ReviewStatsProps {
  locationId?: number;
  period?: string;
}

function StatCardSkeleton() {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg skeleton" />
        <div className="flex-1">
          <div className="h-4 w-16 rounded skeleton mb-2" />
          <div className="h-6 w-12 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function ReviewStats({ locationId, period }: ReviewStatsProps) {
  const { t } = useTranslation('dashboard');
  const { data: stats, isLoading } = useReviewStats({
    location_id: locationId,
    period,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const statCards = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: t('reviews.stats.total'),
      value: stats?.total ?? 0,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: t('reviews.stats.pending'),
      value: stats?.pending ?? 0,
      color:
        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      warning: (stats?.pending ?? 0) > 0,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: t('reviews.stats.averageRating'),
      value: stats?.average_rating?.toFixed(1) ?? '-',
      suffix: '/5',
      color:
        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: t('reviews.stats.responseRate'),
      value: stats?.response_rate ?? 0,
      suffix: '%',
      color:
        (stats?.response_rate ?? 0) >= 80
          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-tertiary dark:text-dark-tertiary font-medium">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-dark-primary dark:text-primary">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-sm text-tertiary dark:text-dark-tertiary">
                    {stat.suffix}
                  </span>
                )}
                {stat.warning && (
                  <span className="ml-1 text-amber-500 text-sm">!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
