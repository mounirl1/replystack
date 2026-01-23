import api from './api';
import type {
  SentimentFilters,
  SentimentSummary,
  SentimentTrends,
  SentimentThemes,
  Granularity,
  SentimentLabel,
} from '../types/sentiment';

function buildParams(filters: SentimentFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.location_id) {
    params.set('location_id', String(filters.location_id));
  }
  if (filters.platform?.length) {
    filters.platform.forEach((p) => params.append('platform[]', p));
  }
  if (filters.date_from) {
    params.set('date_from', filters.date_from);
  }
  if (filters.date_to) {
    params.set('date_to', filters.date_to);
  }

  return params;
}

export async function getSentimentSummary(
  filters: SentimentFilters = {}
): Promise<SentimentSummary> {
  const params = buildParams(filters);
  const response = await api.get<SentimentSummary>(
    `/reviews/sentiment/summary?${params}`
  );
  return response.data;
}

export async function getSentimentTrends(
  filters: SentimentFilters = {},
  granularity: Granularity = 'day'
): Promise<SentimentTrends> {
  const params = buildParams(filters);
  params.set('granularity', granularity);

  const response = await api.get<SentimentTrends>(
    `/reviews/sentiment/trends?${params}`
  );
  return response.data;
}

export async function getSentimentThemes(
  filters: SentimentFilters = {},
  sentiment?: SentimentLabel
): Promise<SentimentThemes> {
  const params = buildParams(filters);
  if (sentiment) {
    params.set('sentiment', sentiment);
  }

  const response = await api.get<SentimentThemes>(
    `/reviews/sentiment/themes?${params}`
  );
  return response.data;
}

export const sentimentApi = {
  getSummary: getSentimentSummary,
  getTrends: getSentimentTrends,
  getThemes: getSentimentThemes,
};
