import api from './api';
import type {
  Review,
  ReviewFilters,
  ReviewsResponse,
  ReviewStats,
  ReviewStatus,
} from '../types/review';

export async function getReviews(
  filters: ReviewFilters,
  cursor?: string
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
  if (filters.rating_min) {
    params.set('rating_min', String(filters.rating_min));
  }
  if (filters.rating_max) {
    params.set('rating_max', String(filters.rating_max));
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
  if (cursor) {
    params.set('cursor', cursor);
  }

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

export const reviewsApi = {
  getReviews,
  getReviewStats,
  getReview,
  updateReviewStatus,
  publishReply,
  triggerFetch,
};
