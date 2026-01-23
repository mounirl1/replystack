import { useQuery } from '@tanstack/react-query';
import * as sentimentService from '../services/sentiment';
import type { SentimentFilters, Granularity, SentimentLabel } from '../types/sentiment';

/**
 * Hook for fetching sentiment summary
 */
export function useSentimentSummary(filters: SentimentFilters = {}) {
  return useQuery({
    queryKey: ['sentiment', 'summary', filters],
    queryFn: () => sentimentService.getSentimentSummary(filters),
    staleTime: 15 * 60 * 1000, // 15 minutes (matches backend cache)
  });
}

/**
 * Hook for fetching sentiment trends
 */
export function useSentimentTrends(
  filters: SentimentFilters = {},
  granularity: Granularity = 'day'
) {
  return useQuery({
    queryKey: ['sentiment', 'trends', filters, granularity],
    queryFn: () => sentimentService.getSentimentTrends(filters, granularity),
    staleTime: 15 * 60 * 1000, // 15 minutes (matches backend cache)
  });
}

/**
 * Hook for fetching sentiment themes
 */
export function useSentimentThemes(
  filters: SentimentFilters = {},
  sentiment?: SentimentLabel
) {
  return useQuery({
    queryKey: ['sentiment', 'themes', filters, sentiment],
    queryFn: () => sentimentService.getSentimentThemes(filters, sentiment),
    staleTime: 15 * 60 * 1000, // 15 minutes (matches backend cache)
  });
}
