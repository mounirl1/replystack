import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useSentimentSummary } from '../../hooks/useSentiment';

interface SentimentWidgetProps {
  locationId?: number;
}

function SentimentWidgetSkeleton() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 skeleton rounded" />
        <div className="h-8 w-24 skeleton rounded" />
      </div>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full skeleton" />
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="flex-1 h-2 skeleton rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function SentimentWidget({ locationId }: SentimentWidgetProps) {
  const { t } = useTranslation('dashboard');
  const { data, isLoading } = useSentimentSummary(
    locationId ? { location_id: locationId } : {}
  );

  if (isLoading) {
    return <SentimentWidgetSkeleton />;
  }

  // Empty state
  if (!data || data.total_analyzed === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">
              {t('sentiment.widget.title')}
            </h3>
          </div>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-text-tertiary mb-3">
            {t('sentiment.summary.empty.description')}
          </p>
          <Link to="/analytics/sentiment">
            <Button variant="outline" size="sm" rightIcon={<ArrowUpRight size={14} />}>
              {t('sentiment.widget.viewDetails')}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Score from -1 to 1, convert to 0-100 for display
  const score = data.average_score;
  const normalizedScore = score !== null ? Math.round(((score + 1) / 2) * 100) : null;

  // Determine color based on score
  const getScoreColor = (s: number | null) => {
    if (s === null) return { text: 'text-gray-500', bg: 'bg-gray-500' };
    if (s >= 60) return { text: 'text-green-500', bg: 'bg-green-500' };
    if (s >= 40) return { text: 'text-amber-500', bg: 'bg-amber-500' };
    return { text: 'text-red-500', bg: 'bg-red-500' };
  };

  const colors = getScoreColor(normalizedScore);

  const bars = [
    {
      label: t('sentiment.positive'),
      percentage: data.distribution_percentages.positive,
      color: 'bg-green-500',
    },
    {
      label: t('sentiment.neutral'),
      percentage: data.distribution_percentages.neutral,
      color: 'bg-amber-500',
    },
    {
      label: t('sentiment.negative'),
      percentage: data.distribution_percentages.negative,
      color: 'bg-red-500',
    },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">
            {t('sentiment.widget.title')}
          </h3>
        </div>
        <Link to="/analytics/sentiment">
          <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={14} />}>
            {t('sentiment.widget.viewDetails')}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {/* Score Circle */}
        <div className="flex-shrink-0">
          <div className={`relative w-20 h-20 rounded-full border-4 ${normalizedScore !== null ? (normalizedScore >= 60 ? 'border-green-200 dark:border-green-800' : normalizedScore >= 40 ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800') : 'border-gray-200 dark:border-gray-700'} flex flex-col items-center justify-center`}>
            <span className={`text-2xl font-bold ${colors.text}`}>
              {normalizedScore ?? '-'}
            </span>
            <span className="text-xs text-text-tertiary">
              {t('sentiment.widget.score')}
            </span>
          </div>
          {/* Score change */}
          {data.score_change && (
            <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-medium ${
              data.score_change.direction === 'up' ? 'text-green-500' :
              data.score_change.direction === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {data.score_change.direction === 'up' && <TrendingUp size={12} />}
              {data.score_change.direction === 'down' && <TrendingDown size={12} />}
              {data.score_change.direction === 'stable' && <Minus size={12} />}
              <span>
                {data.score_change.direction === 'stable'
                  ? t('sentiment.stable')
                  : `${data.score_change.percent > 0 ? '+' : ''}${data.score_change.percent.toFixed(1)}%`
                }
              </span>
            </div>
          )}
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {bars.map((bar) => (
            <div key={bar.label} className="flex items-center gap-2">
              <span className="text-xs text-text-tertiary w-16 truncate">
                {bar.label}
              </span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                  style={{ width: `${bar.percentage}%` }}
                />
              </div>
              <span className="text-xs text-text-tertiary w-10 text-right">
                {bar.percentage}%
              </span>
            </div>
          ))}
          <p className="text-xs text-text-tertiary pt-1">
            {data.total_analyzed} {t('sentiment.widget.reviews')}
          </p>
        </div>
      </div>
    </Card>
  );
}
