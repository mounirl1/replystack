import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useSentimentSummary,
  useSentimentTrends,
  useSentimentThemes,
} from '../../hooks/useSentiment';
import {
  SentimentSummaryCard,
  SentimentTrendsChart,
  SentimentThemesCard,
  SentimentFilters,
} from '../../components/sentiment';
import { Button } from '../../components/ui/Button';
import { locationsApi, type Location } from '../../services/api';
import type { Granularity, SentimentLabel, SentimentFilters as Filters } from '../../types/sentiment';

export function SentimentAnalytics() {
  const { t } = useTranslation('dashboard');

  // State for locations
  const [locations, setLocations] = useState<Location[]>([]);

  // State for filters
  const [filters, setFilters] = useState<Filters>({});
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [themeSentimentFilter, setThemeSentimentFilter] = useState<SentimentLabel | undefined>();

  // Load locations
  useEffect(() => {
    locationsApi.getAll().then((response) => {
      setLocations(response.locations || []);
    });
  }, []);

  // Fetch data using hooks
  const { data: summaryData, isLoading: summaryLoading } = useSentimentSummary(filters);
  const { data: trendsData, isLoading: trendsLoading } = useSentimentTrends(filters, granularity);
  const { data: themesData, isLoading: themesLoading } = useSentimentThemes(filters, themeSentimentFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
              {t('sentiment.backToDashboard')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Page title */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary-500" />
          </div>
          <h1 className="text-2xl font-semibold text-text-dark-primary dark:text-text-primary">
            {t('sentiment.pageTitle')}
          </h1>
        </div>
        <p className="text-text-dark-secondary dark:text-text-secondary">
          {t('sentiment.pageDescription')}
        </p>
      </div>

      {/* Filters */}
      <SentimentFilters
        filters={filters}
        onFiltersChange={setFilters}
        locations={locations}
      />

      {/* Summary Card */}
      <SentimentSummaryCard
        data={summaryData}
        isLoading={summaryLoading}
      />

      {/* Grid for Trends and Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <SentimentTrendsChart
          data={trendsData}
          isLoading={trendsLoading}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />

        {/* Themes Card */}
        <SentimentThemesCard
          data={themesData}
          isLoading={themesLoading}
          sentimentFilter={themeSentimentFilter}
          onSentimentFilterChange={setThemeSentimentFilter}
        />
      </div>
    </div>
  );
}
