import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { useReviews, useUpdateReviewStatus, usePublishReply } from '../../hooks/useReviews';
import type { Review, ReviewFilters, ReviewStatus } from '../../types/review';

interface ReviewListProps {
  filters: ReviewFilters;
  onSelectReview: (review: Review) => void;
}

function ReviewCardSkeleton() {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded skeleton" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 rounded skeleton" />
            ))}
          </div>
          <div className="w-16 h-4 rounded skeleton" />
        </div>
        <div className="w-20 h-5 rounded-full skeleton" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full skeleton" />
        <div className="w-24 h-4 rounded skeleton" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded skeleton" />
        <div className="h-4 w-3/4 rounded skeleton" />
      </div>
      <div className="flex gap-2">
        <div className="w-24 h-8 rounded-lg skeleton" />
        <div className="w-20 h-8 rounded-lg skeleton" />
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-primary dark:text-primary mb-2">
        {t('reviews.empty.title')}
      </h3>
      <p className="text-sm text-tertiary dark:text-dark-tertiary max-w-sm mx-auto">
        {t('reviews.empty.description')}
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('dashboard');

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-primary dark:text-primary mb-2">
        {t('reviews.error.title')}
      </h3>
      <p className="text-sm text-tertiary dark:text-dark-tertiary max-w-sm mx-auto mb-4">
        {t('reviews.error.description')}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        {t('reviews.error.retry')}
      </button>
    </div>
  );
}

export function ReviewList({ filters, onSelectReview }: ReviewListProps) {
  const { t } = useTranslation('dashboard');
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useReviews(filters);

  const updateStatus = useUpdateReviewStatus();
  const publishReply = usePublishReply();

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const handleStatusChange = (reviewId: number, status: ReviewStatus) => {
    updateStatus.mutate({ reviewId, status });
  };

  const handlePublish = (reviewId: number, content: string) => {
    publishReply.mutate({ reviewId, content });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Flatten pages
  const reviews = data?.pages.flatMap((page) => page.data) || [];

  // Empty state
  if (reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          onSelect={() => onSelectReview(review)}
          onStatusChange={(status) => handleStatusChange(review.id, status)}
          onPublish={
            review.can_publish_via_api
              ? (content) => handlePublish(review.id, content)
              : undefined
          }
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-10">
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
          </div>
        )}
        {!hasNextPage && reviews.length > 0 && (
          <p className="text-center text-sm text-tertiary dark:text-dark-tertiary py-4">
            {t('reviews.noMore')}
          </p>
        )}
      </div>
    </div>
  );
}
