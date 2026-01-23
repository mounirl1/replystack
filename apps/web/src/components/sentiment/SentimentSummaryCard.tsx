import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import type { SentimentSummary } from '../../types/sentiment';

interface SentimentSummaryCardProps {
  data?: SentimentSummary;
  isLoading?: boolean;
}

function SentimentSummarySkeleton() {
  return (
    <Card>
      <div className="flex items-start justify-between mb-6">
        <div className="h-6 w-48 skeleton rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score gauge skeleton */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-32 h-32 rounded-full skeleton" />
          <div className="h-4 w-24 skeleton rounded mt-4" />
        </div>
        {/* Distribution skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 skeleton rounded" />
                <div className="h-4 w-12 skeleton rounded" />
              </div>
              <div className="h-3 w-full skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ScoreGauge({ score, change }: { score: number | null; change: SentimentSummary['score_change'] }) {
  const { t } = useTranslation('dashboard');

  if (score === null) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="text-2xl text-text-tertiary">-</span>
        </div>
        <p className="text-sm text-text-tertiary mt-3">{t('sentiment.noData')}</p>
      </div>
    );
  }

  // Score from -1 to 1, convert to 0-100 for display
  const normalizedScore = ((score + 1) / 2) * 100;
  const displayScore = Math.round(normalizedScore);

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 60) return { stroke: '#22c55e', text: 'text-green-500', bg: 'bg-green-500' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500' };
    return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-500' };
  };

  const colors = getScoreColor(displayScore);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colors.text}`}>{displayScore}</span>
          <span className="text-xs text-text-tertiary">/100</span>
        </div>
      </div>

      {/* Score change indicator */}
      {change && (
        <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${
          change.direction === 'up' ? 'text-green-500' :
          change.direction === 'down' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {change.direction === 'up' && <TrendingUp size={16} />}
          {change.direction === 'down' && <TrendingDown size={16} />}
          {change.direction === 'stable' && <Minus size={16} />}
          <span>
            {change.direction === 'stable'
              ? t('sentiment.stable')
              : `${change.percent > 0 ? '+' : ''}${change.percent.toFixed(1)}%`
            }
          </span>
        </div>
      )}
    </div>
  );
}

function DistributionBars({ distribution, percentages }: {
  distribution: SentimentSummary['distribution'];
  percentages: SentimentSummary['distribution_percentages'];
}) {
  const { t } = useTranslation('dashboard');

  const bars = [
    {
      key: 'positive' as const,
      label: t('sentiment.positive'),
      count: distribution.positive,
      percentage: percentages.positive,
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      key: 'neutral' as const,
      label: t('sentiment.neutral'),
      count: distribution.neutral,
      percentage: percentages.neutral,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      key: 'negative' as const,
      label: t('sentiment.negative'),
      count: distribution.negative,
      percentage: percentages.negative,
      color: 'bg-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="space-y-4">
      {bars.map((bar) => (
        <div key={bar.key} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text-dark-primary dark:text-text-primary">
              {bar.label}
            </span>
            <span className="text-text-tertiary">
              {bar.count} ({bar.percentage}%)
            </span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${bar.bgColor}`}>
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${bar.color}`}
              style={{ width: `${bar.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SentimentSummaryCard({ data, isLoading }: SentimentSummaryCardProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return <SentimentSummarySkeleton />;
  }

  if (!data || data.total_analyzed === 0) {
    return (
      <Card>
        <CardHeader title={t('sentiment.summary.title')} />
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={24} className="text-text-tertiary" />
          </div>
          <p className="text-text-dark-primary dark:text-text-primary font-medium mb-1">
            {t('sentiment.summary.empty.title')}
          </p>
          <p className="text-sm text-text-tertiary">
            {t('sentiment.summary.empty.description')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('sentiment.summary.title')}
        description={t('sentiment.summary.analyzed', { count: data.total_analyzed })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <ScoreGauge score={data.average_score} change={data.score_change} />
        <DistributionBars
          distribution={data.distribution}
          percentages={data.distribution_percentages}
        />
      </div>
    </Card>
  );
}
