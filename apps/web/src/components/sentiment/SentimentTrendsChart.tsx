import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import type { SentimentTrends, Granularity } from '../../types/sentiment';

interface SentimentTrendsChartProps {
  data?: SentimentTrends;
  isLoading?: boolean;
  granularity: Granularity;
  onGranularityChange?: (granularity: Granularity) => void;
}

function SentimentTrendsSkeleton() {
  return (
    <Card>
      <div className="flex items-start justify-between mb-6">
        <div className="h-6 w-40 skeleton rounded" />
        <div className="h-8 w-32 skeleton rounded" />
      </div>
      <div className="h-48 skeleton rounded" />
    </Card>
  );
}

function TrendLine({ data }: { data: SentimentTrends['data'] }) {
  if (data.length === 0) return null;

  const maxScore = 1;
  const minScore = -1;
  const range = maxScore - minScore;

  // Calculate chart dimensions
  const chartHeight = 180;
  const padding = { top: 10, bottom: 30, left: 0, right: 0 };

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = padding.top + ((maxScore - point.avg_score) / range) * (chartHeight - padding.top - padding.bottom);
    return { x, y, ...point };
  });

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

  return (
    <div className="relative h-48">
      <svg
        viewBox={`0 0 100 ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            y1={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
            x2="100"
            y2={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
            className="text-gray-400"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaD}
          fill="url(#areaGradient)"
          className="transition-all duration-500"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(99, 102, 241)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-500"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="rgb(99, 102, 241)"
            className="transition-all duration-500"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-text-tertiary px-1">
        {data.length <= 7 ? (
          data.map((point, index) => (
            <span key={index} className="truncate max-w-[60px]">
              {formatPeriodLabel(point.period)}
            </span>
          ))
        ) : (
          <>
            <span>{formatPeriodLabel(data[0].period)}</span>
            <span>{formatPeriodLabel(data[Math.floor(data.length / 2)].period)}</span>
            <span>{formatPeriodLabel(data[data.length - 1].period)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function formatPeriodLabel(period: string): string {
  // Handle different period formats
  if (period.includes('-W')) {
    // Week format: 2024-W01
    const week = period.split('-W')[1];
    return `W${week}`;
  }
  if (period.match(/^\d{4}-\d{2}$/)) {
    // Month format: 2024-01
    const date = new Date(period + '-01');
    return date.toLocaleDateString(undefined, { month: 'short' });
  }
  // Day format: 2024-01-15
  const date = new Date(period);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function DistributionLegend({ data }: { data: SentimentTrends['data'] }) {
  const { t } = useTranslation('dashboard');

  // Aggregate totals
  const totals = data.reduce(
    (acc, point) => ({
      positive: acc.positive + point.distribution.positive,
      neutral: acc.neutral + point.distribution.neutral,
      negative: acc.negative + point.distribution.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );

  const items = [
    { label: t('sentiment.positive'), value: totals.positive, color: 'bg-green-500' },
    { label: t('sentiment.neutral'), value: totals.neutral, color: 'bg-amber-500' },
    { label: t('sentiment.negative'), value: totals.negative, color: 'bg-red-500' },
  ];

  return (
    <div className="flex items-center gap-4 mt-4 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-text-tertiary">
            {item.label}: <span className="font-medium text-text-dark-primary dark:text-text-primary">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function SentimentTrendsChart({
  data,
  isLoading,
  granularity,
  onGranularityChange
}: SentimentTrendsChartProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return <SentimentTrendsSkeleton />;
  }

  const granularityOptions: { value: Granularity; label: string }[] = [
    { value: 'day', label: t('sentiment.trends.granularity.day') },
    { value: 'week', label: t('sentiment.trends.granularity.week') },
    { value: 'month', label: t('sentiment.trends.granularity.month') },
  ];

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader title={t('sentiment.trends.title')} />
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={24} className="text-text-tertiary" />
          </div>
          <p className="text-text-dark-primary dark:text-text-primary font-medium mb-1">
            {t('sentiment.trends.empty.title')}
          </p>
          <p className="text-sm text-text-tertiary">
            {t('sentiment.trends.empty.description')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={t('sentiment.trends.title')}
        action={
          onGranularityChange && (
            <div className="flex gap-1 p-1 bg-light-hover dark:bg-dark-hover rounded-lg">
              {granularityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onGranularityChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    granularity === option.value
                      ? 'bg-white dark:bg-dark-surface text-primary-600 shadow-sm'
                      : 'text-text-tertiary hover:text-text-dark-primary dark:hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )
        }
      />
      <TrendLine data={data.data} />
      <DistributionLegend data={data.data} />
    </Card>
  );
}
