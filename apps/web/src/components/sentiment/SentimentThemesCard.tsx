import { useTranslation } from 'react-i18next';
import { Tag, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import type { SentimentThemes, SentimentTheme, SentimentLabel } from '../../types/sentiment';

interface SentimentThemesCardProps {
  data?: SentimentThemes;
  isLoading?: boolean;
  sentimentFilter?: SentimentLabel;
  onSentimentFilterChange?: (sentiment?: SentimentLabel) => void;
}

function SentimentThemesSkeleton() {
  return (
    <Card>
      <div className="flex items-start justify-between mb-6">
        <div className="h-6 w-32 skeleton rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-24 skeleton rounded-full" />
        ))}
      </div>
    </Card>
  );
}

function ThemeBadge({ theme }: { theme: SentimentTheme }) {
  const { t } = useTranslation('dashboard');

  // Determine dominant sentiment
  const { positive, neutral, negative } = theme.sentiment_breakdown;
  const total = positive + neutral + negative;

  let dominantSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let dominantPercent = 0;

  if (total > 0) {
    const positivePercent = (positive / total) * 100;
    const negativePercent = (negative / total) * 100;
    const neutralPercent = (neutral / total) * 100;

    if (positivePercent > negativePercent && positivePercent > neutralPercent) {
      dominantSentiment = 'positive';
      dominantPercent = positivePercent;
    } else if (negativePercent > positivePercent && negativePercent > neutralPercent) {
      dominantSentiment = 'negative';
      dominantPercent = negativePercent;
    } else {
      dominantSentiment = 'neutral';
      dominantPercent = neutralPercent;
    }
  }

  const getColors = () => {
    switch (dominantSentiment) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getIcon = () => {
    switch (dominantSentiment) {
      case 'positive':
        return <ThumbsUp size={12} />;
      case 'negative':
        return <ThumbsDown size={12} />;
      default:
        return <Minus size={12} />;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:scale-105 ${getColors()}`}
      title={`${t(`sentiment.themes.labels.${theme.theme}`)}: ${theme.count} ${t('sentiment.themes.mentions')}\n${t('sentiment.positive')}: ${positive} | ${t('sentiment.neutral')}: ${neutral} | ${t('sentiment.negative')}: ${negative}`}
    >
      {getIcon()}
      <span>{t(`sentiment.themes.labels.${theme.theme}`)}</span>
      <span className="text-xs opacity-70">({theme.count})</span>
    </div>
  );
}

function SentimentFilterTabs({
  current,
  onChange
}: {
  current?: SentimentLabel;
  onChange: (sentiment?: SentimentLabel) => void;
}) {
  const { t } = useTranslation('dashboard');

  const tabs: { value: SentimentLabel | undefined; label: string; color?: string }[] = [
    { value: undefined, label: t('sentiment.themes.filters.all') },
    { value: 'positive', label: t('sentiment.positive'), color: 'text-green-500' },
    { value: 'neutral', label: t('sentiment.neutral'), color: 'text-amber-500' },
    { value: 'negative', label: t('sentiment.negative'), color: 'text-red-500' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-light-hover dark:bg-dark-hover rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.value ?? 'all'}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            current === tab.value
              ? `bg-white dark:bg-dark-surface shadow-sm ${tab.color || 'text-primary-600'}`
              : 'text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function SentimentThemesCard({
  data,
  isLoading,
  sentimentFilter,
  onSentimentFilterChange
}: SentimentThemesCardProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return <SentimentThemesSkeleton />;
  }

  if (!data || data.themes.length === 0) {
    return (
      <Card>
        <CardHeader title={t('sentiment.themes.title')} />
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={24} className="text-text-tertiary" />
          </div>
          <p className="text-text-dark-primary dark:text-text-primary font-medium mb-1">
            {t('sentiment.themes.empty.title')}
          </p>
          <p className="text-sm text-text-tertiary">
            {t('sentiment.themes.empty.description')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('sentiment.themes.title')}
        description={t('sentiment.themes.description', { count: data.total_reviews })}
        action={
          onSentimentFilterChange && (
            <SentimentFilterTabs
              current={sentimentFilter}
              onChange={onSentimentFilterChange}
            />
          )
        }
      />
      <div className="flex flex-wrap gap-2">
        {data.themes.map((theme) => (
          <ThemeBadge key={theme.theme} theme={theme} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-light-border dark:border-dark-border text-xs text-text-tertiary">
        <div className="flex items-center gap-1">
          <ThumbsUp size={12} className="text-green-500" />
          <span>{t('sentiment.themes.legend.positive')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Minus size={12} className="text-amber-500" />
          <span>{t('sentiment.themes.legend.neutral')}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown size={12} className="text-red-500" />
          <span>{t('sentiment.themes.legend.negative')}</span>
        </div>
      </div>
    </Card>
  );
}
