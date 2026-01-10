import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Copy,
  Send,
  RefreshCw,
  Check,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { PlatformIcon, getPlatformName } from '../ui/PlatformIcon';
import { usePublishReply, useUpdateReviewStatus } from '../../hooks/useReviews';
import type { Review } from '../../types/review';
import { COPY_FEEDBACK_DURATION } from '@/constants';

interface ReviewDetailModalProps {
  review: Review | null;
  isOpen: boolean;
  onClose: () => void;
}

const LENGTHS = ['short', 'medium', 'detailed'] as const;
const TONES = ['professional', 'friendly', 'formal', 'casual'] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
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

export function ReviewDetailModal({
  review,
  isOpen,
  onClose,
}: ReviewDetailModalProps) {
  const { t } = useTranslation('dashboard');
  const [selectedLength, setSelectedLength] = useState<typeof LENGTHS[number]>('medium');
  const [selectedTone, setSelectedTone] = useState<typeof TONES[number]>('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const publishReply = usePublishReply();
  const updateStatus = useUpdateReviewStatus();

  if (!isOpen || !review) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/replies/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review_content: review.content,
          review_rating: review.rating,
          review_author: review.author_name,
          platform: review.platform,
          length: selectedLength,
          tone: selectedTone,
          specific_context: customPrompt || undefined,
          language: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reply');
      }

      const data = await response.json();
      setGeneratedReply(data.reply);

      // Mark as replied if pending
      if (review.status === 'pending') {
        updateStatus.mutate({ reviewId: review.id, status: 'replied' });
      }
    } catch (error) {
      console.error('Failed to generate reply:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
  };

  const handlePublish = (content: string) => {
    publishReply.mutate({
      reviewId: review.id,
      content,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-dark-primary dark:text-primary">
            {t('reviews.modal.title', { author: review.author_name })}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-tertiary hover:text-secondary rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Review details */}
          <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <PlatformIcon platform={review.platform} size="md" />
              <span className="text-sm font-medium text-secondary dark:text-dark-secondary">
                {getPlatformName(review.platform)}
              </span>
              <StarRating rating={review.rating} />
              <span className="text-sm text-tertiary dark:text-dark-tertiary ml-auto">
                {formatDate(review.published_at)}
              </span>
            </div>
            <p className="text-sm text-dark-primary dark:text-primary leading-relaxed">
              {review.content}
            </p>
          </div>

          {/* Existing responses */}
          {review.responses_count > 0 && review.latest_response && (
            <div>
              <h3 className="text-sm font-semibold text-dark-primary dark:text-primary mb-3">
                {t('reviews.modal.responses', { count: review.responses_count })}
              </h3>
              <div className="bg-light-bg dark:bg-dark-bg rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-tertiary dark:text-dark-tertiary">
                    {formatDate(review.latest_response.created_at)}
                  </span>
                  {review.latest_response.is_published ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {t('reviews.published')}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {t('reviews.notPublished')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-secondary dark:text-dark-secondary mb-3">
                  {review.latest_response.content}
                </p>
                <div className="flex gap-2">
                  {review.can_publish_via_api &&
                    !review.latest_response.is_published && (
                      <button
                        onClick={() =>
                          handlePublish(review.latest_response!.content)
                        }
                        disabled={publishReply.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {publishReply.isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        {t('reviews.actions.publish')}
                      </button>
                    )}
                  <button
                    onClick={() => handleCopy(review.latest_response!.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-tertiary hover:text-secondary bg-light-hover dark:bg-dark-hover rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? t('reviews.actions.copied') : t('reviews.actions.copy')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate new reply */}
          <div>
            <h3 className="text-sm font-semibold text-dark-primary dark:text-primary mb-3">
              {t('reviews.modal.generateTitle')}
            </h3>

            {/* Options */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Length selector */}
              <div className="relative">
                <select
                  value={selectedLength}
                  onChange={(e) =>
                    setSelectedLength(e.target.value as typeof LENGTHS[number])
                  }
                  className="appearance-none px-3 py-2 pr-8 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {LENGTHS.map((length) => (
                    <option key={length} value={length}>
                      {t(`reviews.modal.lengths.${length}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
              </div>

              {/* Tone selector */}
              <div className="relative">
                <select
                  value={selectedTone}
                  onChange={(e) =>
                    setSelectedTone(e.target.value as typeof TONES[number])
                  }
                  className="appearance-none px-3 py-2 pr-8 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {t(`reviews.modal.tones.${tone}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
              </div>
            </div>

            {/* Custom prompt */}
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t('reviews.modal.customPromptPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none mb-4"
            />

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating
                ? t('reviews.modal.generating')
                : t('reviews.modal.generate')}
            </button>
          </div>

          {/* Generated reply */}
          {generatedReply && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {t('reviews.modal.generatedReply')}
                </span>
                <button
                  onClick={() => handleCopy(generatedReply)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? t('reviews.actions.copied') : t('reviews.actions.copy')}
                </button>
              </div>
              <textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-dark-surface border border-primary-200 dark:border-primary-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/50 rounded-lg transition-colors"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`}
                  />
                  {t('reviews.modal.regenerate')}
                </button>
                {review.can_publish_via_api && (
                  <button
                    onClick={() => handlePublish(generatedReply)}
                    disabled={publishReply.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {publishReply.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    {t('reviews.actions.publish')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
