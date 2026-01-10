import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  MessageSquare,
  Send,
  ExternalLink,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import type { Review, ReviewStatus } from '../../types/review';
import { COPY_FEEDBACK_DURATION } from '@/constants';

interface ReviewCardProps {
  review: Review;
  onSelect: () => void;
  onStatusChange: (status: ReviewStatus) => void;
  onPublish?: (content: string) => void;
}

const statusColors: Record<ReviewStatus, string> = {
  pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  replied:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ignored: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-200 dark:text-gray-700'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCard({
  review,
  onSelect,
  onStatusChange,
  onPublish,
}: ReviewCardProps) {
  const { t } = useTranslation('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (review.latest_response) {
      await navigator.clipboard.writeText(review.latest_response.content);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    }
  };

  const handlePublish = () => {
    if (review.latest_response && onPublish) {
      onPublish(review.latest_response.content);
      setShowPublishMenu(false);
    }
  };

  const canPublish =
    review.can_publish_via_api &&
    review.latest_response &&
    !review.latest_response.is_published;

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={review.platform} size="md" />
          <StarRating rating={review.rating} />
          <span className="text-xs text-tertiary dark:text-dark-tertiary">
            {review.time_ago}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[review.status]}`}
        >
          {t(`reviews.status.${review.status}`)}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        {review.author_avatar ? (
          <img
            src={review.author_avatar}
            alt={review.author_name}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
              {review.author_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-medium text-dark-primary dark:text-primary">
          {review.author_name}
        </span>
        {review.location && (
          <span className="text-xs text-tertiary dark:text-dark-tertiary">
            @ {review.location.name}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-secondary dark:text-dark-secondary mb-4 line-clamp-3">
        {review.content_excerpt || review.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSelect}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {t('reviews.actions.reply')}
        </button>

        {canPublish && (
          <div className="relative">
            <button
              onClick={() => setShowPublishMenu(!showPublishMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              {t('reviews.actions.publish')}
            </button>
            {showPublishMenu && (
              <div className="absolute top-full left-0 mt-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-lg py-1 z-10 min-w-[200px]">
                <p className="px-3 py-2 text-xs text-tertiary border-b border-light-border dark:border-dark-border">
                  {t('reviews.actions.publishTo', {
                    platform: getPlatformName(review.platform),
                  })}
                </p>
                <button
                  onClick={handlePublish}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  {t('reviews.actions.confirmPublish')}
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied
                    ? t('reviews.actions.copied')
                    : t('reviews.actions.copyInstead')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* More menu */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              {review.status !== 'replied' && (
                <button
                  onClick={() => {
                    onStatusChange('replied');
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-500" />
                  {t('reviews.actions.markReplied')}
                </button>
              )}
              {review.status !== 'ignored' && (
                <button
                  onClick={() => {
                    onStatusChange('ignored');
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-gray-500" />
                  {t('reviews.actions.ignore')}
                </button>
              )}
              <a
                href={`#`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3 py-2 text-sm text-left hover:bg-light-hover dark:hover:bg-dark-hover flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t('reviews.actions.viewOnPlatform', {
                  platform: getPlatformName(review.platform),
                })}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Response preview */}
      {review.latest_response && (
        <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-tertiary dark:text-dark-tertiary">
              {t('reviews.latestResponse')}
            </span>
            {review.latest_response.is_published ? (
              <span className="text-xs text-green-600 dark:text-green-400">
                {t('reviews.published')}
              </span>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {t('reviews.notPublished')}
              </span>
            )}
          </div>
          <p className="text-xs text-secondary dark:text-dark-secondary line-clamp-2">
            {review.latest_response.content}
          </p>
        </div>
      )}
    </div>
  );
}
