export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type Granularity = 'day' | 'week' | 'month';

export interface SentimentFilters {
  location_id?: number;
  platform?: string[];
  date_from?: string;
  date_to?: string;
}

export interface SentimentSummary {
  total_analyzed: number;
  average_score: number | null;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  distribution_percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
  score_change: {
    absolute: number;
    percent: number;
    direction: 'up' | 'down' | 'stable';
  } | null;
  period: {
    date_from: string | null;
    date_to: string | null;
    location_id: number | null;
    platforms: string[] | null;
  };
}

export interface SentimentTrendPoint {
  period: string;
  avg_score: number;
  count: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SentimentTrends {
  granularity: Granularity;
  data: SentimentTrendPoint[];
  period: {
    date_from: string | null;
    date_to: string | null;
    location_id: number | null;
    platforms: string[] | null;
  };
}

export interface SentimentTheme {
  theme: string;
  count: number;
  avg_score: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SentimentThemes {
  themes: SentimentTheme[];
  total_reviews: number;
  period: {
    date_from: string | null;
    date_to: string | null;
    location_id: number | null;
    platforms: string[] | null;
  };
}
