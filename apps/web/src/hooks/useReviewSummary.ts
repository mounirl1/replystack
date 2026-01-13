import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reviewsService from '../services/reviews';
import type { ReviewFilters } from '../types/review';

/**
 * Hook for fetching an existing review summary for given filters
 */
export function useReviewSummary(filters: ReviewFilters) {
  return useQuery({
    queryKey: ['review-summary', filters],
    queryFn: () => reviewsService.getReviewSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for generating a new AI review summary
 */
export function useGenerateReviewSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      filters,
      language,
    }: {
      filters: ReviewFilters;
      language?: string;
    }) => reviewsService.generateReviewSummary(filters, language),
    onSuccess: (data, variables) => {
      // Update the summary cache for these filters
      queryClient.setQueryData(['review-summary', variables.filters], data.summary);
      // Invalidate user query to refresh quota
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
