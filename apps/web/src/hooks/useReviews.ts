import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as reviewsService from '../services/reviews';
import type { ReviewFilters, ReviewStatus } from '../types/review';

/**
 * Hook for fetching paginated reviews with infinite scroll
 */
export function useReviews(filters: ReviewFilters) {
  return useInfiniteQuery({
    queryKey: ['reviews', filters],
    queryFn: ({ pageParam }) =>
      reviewsService.getReviews(filters, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.meta?.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

/**
 * Hook for fetching review statistics
 */
export function useReviewStats(filters: {
  location_id?: number;
  period?: string;
}) {
  return useQuery({
    queryKey: ['reviews', 'stats', filters],
    queryFn: () => reviewsService.getReviewStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
  });
}

/**
 * Hook for fetching a single review
 */
export function useReview(id: number | null) {
  return useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsService.getReview(id!),
    enabled: !!id,
  });
}

/**
 * Hook for updating review status
 */
export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: number;
      status: ReviewStatus;
    }) => reviewsService.updateReviewStatus(reviewId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

/**
 * Hook for publishing a reply via API
 */
export function usePublishReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      content,
    }: {
      reviewId: number;
      content: string;
    }) => reviewsService.publishReply(reviewId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

/**
 * Hook for triggering review fetch from API
 */
export function useTriggerFetch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      locationId,
      platform,
    }: {
      locationId: number;
      platform?: string;
    }) => reviewsService.triggerFetch(locationId, platform),
    onSuccess: () => {
      // Invalidate after a delay to allow backend to fetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }, 5000);
    },
  });
}
