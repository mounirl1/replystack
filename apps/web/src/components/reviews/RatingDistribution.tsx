import { useTranslation } from 'react-i18next';

interface RatingDistributionProps {
  byRating?: Record<number, number>;
  total?: number;
  isLoading?: boolean;
}

function RatingDistributionSkeleton() {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
      <div className="h-5 w-40 rounded skeleton mb-4" />
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3">
            <div className="w-8 h-4 rounded skeleton" />
            <div className="flex-1 h-2 rounded-full skeleton" />
            <div className="w-10 h-4 rounded skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatingDistribution({ byRating, total, isLoading }: RatingDistributionProps) {
  const { t } = useTranslation('dashboard');
  const ratings = [5, 4, 3, 2, 1];

  if (isLoading) {
    return <RatingDistributionSkeleton />;
  }

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl p-5 border border-light-border dark:border-dark-border">
      <h3 className="font-semibold text-dark-primary dark:text-primary mb-4">
        {t('reviews.sidebar.ratingDistribution')}
      </h3>
      <div className="space-y-3">
        {ratings.map((rating) => {
          const count = byRating?.[rating] || 0;
          const percentage = total ? Math.round((count / total) * 100) : 0;

          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-8 text-sm text-tertiary dark:text-dark-tertiary flex items-center gap-0.5">
                {rating}
                <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
              <div className="flex-1 h-2 bg-light-bg dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-sm text-tertiary dark:text-dark-tertiary text-right">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
