import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Copy,
  Check,
  Clock,
  Zap,
  Globe,
  Star,
  Chrome,
} from 'lucide-react';
import { repliesApi, type Response } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PlatformBadge } from '@/components/ui/Badge';
import { COPY_FEEDBACK_DURATION } from '@/constants';

export function History() {
  const { t } = useTranslation('dashboard');
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const data = await repliesApi.getHistory();
      setResponses(data.responses);
      setCursor(data.next_cursor);
      setHasMore(!!data.next_cursor);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = await repliesApi.getHistory(cursor);
      setResponses(prev => [...prev, ...data.responses]);
      setCursor(data.next_cursor);
      setHasMore(!!data.next_cursor);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCopy = async (response: Response) => {
    try {
      await navigator.clipboard.writeText(response.content);
      setCopiedId(response.id);
      setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getToneVariant = (tone: string): 'primary' | 'success' | 'info' | 'warning' => {
    switch (tone) {
      case 'professional':
        return 'info';
      case 'friendly':
        return 'success';
      case 'formal':
        return 'primary';
      case 'casual':
        return 'warning';
      default:
        return 'primary';
    }
  };

  // Skeleton loader for response cards
  const ResponseSkeleton = () => (
    <Card>
      <div className="animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-20 bg-light-border dark:bg-dark-border rounded-full" />
          <div className="h-5 w-16 bg-light-border dark:bg-dark-border rounded-full" />
          <div className="h-4 w-24 bg-light-border dark:bg-dark-border rounded ml-auto" />
        </div>
        <div className="bg-light-hover dark:bg-dark-hover rounded-xl p-4 mb-4">
          <div className="h-3 w-20 bg-light-border dark:bg-dark-border rounded mb-2" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-light-border dark:bg-dark-border rounded" />
            <div className="h-4 w-3/4 bg-light-border dark:bg-dark-border rounded" />
          </div>
        </div>
        <div className="h-3 w-16 bg-light-border dark:bg-dark-border rounded mb-2" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-light-border dark:bg-dark-border rounded" />
          <div className="h-4 w-5/6 bg-light-border dark:bg-dark-border rounded" />
          <div className="h-4 w-2/3 bg-light-border dark:bg-dark-border rounded" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-dark-primary dark:text-text-primary">
          {t('history.title')}
        </h1>
        <p className="text-text-dark-secondary dark:text-text-secondary mt-1">
          {t('history.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <ResponseSkeleton />
          <ResponseSkeleton />
          <ResponseSkeleton />
        </div>
      ) : responses.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-text-dark-primary dark:text-text-primary mb-2">
              {t('history.empty.title')}
            </h3>
            <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-4">
              {t('history.empty.description')}
            </p>
            <Button variant="outline" size="sm" leftIcon={<Chrome size={16} />}>
              {t('history.empty.cta')}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Summary */}
          <Card className="!bg-gradient-to-r from-primary-500/10 to-primary-600/5 !border-primary-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-text-dark-secondary dark:text-text-secondary">
                    {t('history.totalReplies')}
                  </p>
                  <p className="text-2xl font-semibold text-text-dark-primary dark:text-text-primary">
                    {responses.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Response List */}
          <div className="space-y-4">
            {responses.map((response) => (
              <Card key={response.id} hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <Badge variant={getToneVariant(response.tone)} size="md">
                        {response.tone}
                      </Badge>
                      {response.review && (
                        <>
                          <PlatformBadge platform={response.review.platform} />
                          {response.review.rating && (
                            <span className="flex items-center gap-1 text-sm text-text-dark-secondary dark:text-text-secondary">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              {response.review.rating}/5
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-xs text-text-tertiary ml-auto flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(response.created_at)}
                      </span>
                    </div>

                    {/* Original Review */}
                    {response.review && (
                      <div className="bg-light-hover dark:bg-dark-hover rounded-xl p-4 mb-4">
                        <p className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
                          {t('history.originalReview')}
                        </p>
                        <p className="text-sm text-text-dark-secondary dark:text-text-secondary line-clamp-3">
                          {response.review.content}
                        </p>
                        {response.review.author_name && (
                          <p className="text-xs text-text-tertiary mt-3">
                            — {response.review.author_name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Generated Reply */}
                    <div>
                      <p className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
                        {t('history.aiReply')}
                      </p>
                      <p className="text-sm text-text-dark-primary dark:text-text-primary leading-relaxed">
                        {response.content}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-text-tertiary">
                      {response.tokens_used && (
                        <span className="flex items-center gap-1">
                          <Zap size={12} />
                          {t('history.tokens', { count: response.tokens_used })}
                        </span>
                      )}
                      {response.generation_time_ms && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {response.generation_time_ms}ms
                        </span>
                      )}
                      <span className="flex items-center gap-1 capitalize">
                        <Globe size={12} />
                        {response.language}
                      </span>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(response)}
                    className={`
                      flex-shrink-0 p-2.5 rounded-xl transition-all duration-150
                      ${copiedId === response.id
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover'
                      }
                    `}
                    title={t('history.copyToClipboard')}
                  >
                    {copiedId === response.id ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                isLoading={isLoadingMore}
              >
                {t('history.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
