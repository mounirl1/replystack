import api from './api';
import type {
  Review,
  ReviewFilters,
  ReviewsResponse,
  ReviewStats,
  ReviewStatus,
  ReviewSummary,
} from '../types/review';

export async function getReviews(
  filters: ReviewFilters,
  page: number = 1,
  perPage: number = 15
): Promise<ReviewsResponse> {
  const params = new URLSearchParams();

  if (filters.location_id) {
    params.set('location_id', String(filters.location_id));
  }
  if (filters.platform?.length) {
    filters.platform.forEach((p) => params.append('platform[]', p));
  }
  if (filters.status?.length) {
    filters.status.forEach((s) => params.append('status[]', s));
  }
  if (filters.ratings?.length) {
    filters.ratings.forEach((r) => params.append('rating[]', String(r)));
  }
  if (filters.date_from) {
    params.set('date_from', filters.date_from);
  }
  if (filters.date_to) {
    params.set('date_to', filters.date_to);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.has_content) {
    params.set('has_content', filters.has_content);
  }
  params.set('page', String(page));
  params.set('per_page', String(perPage));

  const response = await api.get<ReviewsResponse>(`/reviews?${params}`);
  return response.data;
}

export async function getReviewStats(filters: {
  location_id?: number;
  period?: string;
}): Promise<ReviewStats> {
  const params = new URLSearchParams();

  if (filters.location_id) {
    params.set('location_id', String(filters.location_id));
  }
  if (filters.period) {
    params.set('period', filters.period);
  }

  const response = await api.get<{ stats: ReviewStats }>(
    `/reviews/stats?${params}`
  );
  return response.data.stats;
}

export async function getReview(id: number): Promise<Review> {
  const response = await api.get<{ review: Review }>(`/reviews/${id}`);
  return response.data.review;
}

export async function updateReviewStatus(
  reviewId: number,
  status: ReviewStatus
): Promise<Review> {
  const response = await api.patch<{ review: Review }>(
    `/reviews/${reviewId}/status`,
    { status }
  );
  return response.data.review;
}

export async function publishReply(
  reviewId: number,
  content: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(
    `/reviews/${reviewId}/publish`,
    { content }
  );
  return response.data;
}

export async function triggerFetch(
  locationId: number,
  platform?: string
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/reviews/fetch', {
    location_id: locationId,
    platform,
  });
  return response.data;
}

export async function getReviewSummary(
  filters: ReviewFilters
): Promise<ReviewSummary | null> {
  const params = new URLSearchParams();

  if (filters.location_id) {
    params.set('location_id', String(filters.location_id));
  }
  if (filters.platform?.length) {
    filters.platform.forEach((p) => params.append('platform[]', p));
  }
  if (filters.status?.length) {
    filters.status.forEach((s) => params.append('status[]', s));
  }
  if (filters.ratings?.length) {
    filters.ratings.forEach((r) => params.append('rating[]', String(r)));
  }
  if (filters.date_from) {
    params.set('date_from', filters.date_from);
  }

  const response = await api.get<{ summary: ReviewSummary | null }>(
    `/reviews/summary?${params}`
  );
  return response.data.summary;
}

export async function generateReviewSummary(
  filters: ReviewFilters,
  language?: string
): Promise<{ summary: ReviewSummary; quota_remaining: number | 'unlimited' }> {
  const response = await api.post<{
    summary: ReviewSummary;
    quota_remaining: number | 'unlimited';
  }>('/reviews/summarize', {
    location_id: filters.location_id,
    platform: filters.platform,
    status: filters.status,
    rating: filters.ratings,
    date_from: filters.date_from,
    language,
  });
  return response.data;
}

export const reviewsApi = {
  getReviews,
  getReviewStats,
  getReview,
  updateReviewStatus,
  publishReply,
  triggerFetch,
  getReviewSummary,
  generateReviewSummary,
};
