export type ReviewStatus = 'pending' | 'replied' | 'ignored';

export type Platform = 'google' | 'tripadvisor' | 'booking' | 'yelp' | 'facebook';

export interface ReviewResponse {
  id: number;
  content: string;
  tone: string;
  language: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface ReviewLocation {
  id: number;
  name: string;
}

export interface Review {
  id: number;
  platform: Platform;
  external_id: string;
  author_name: string;
  author_avatar?: string;
  rating: number;
  content: string;
  content_excerpt: string;
  language?: string;
  published_at: string;
  time_ago: string;
  status: ReviewStatus;
  replied_at?: string;
  location: ReviewLocation;
  responses_count: number;
  latest_response?: ReviewResponse;
  can_publish_via_api: boolean;
}

export interface ReviewStats {
  total: number;
  pending: number;
  replied: number;
  ignored: number;
  average_rating: number;
  response_rate: number;
  by_platform: Record<string, number>;
  by_rating: Record<number, number>;
  trend: Array<{ date: string; count: number }>;
}

export interface ReviewFilters {
  location_id?: number;
  platform?: Platform[];
  status?: ReviewStatus[];
  rating_min?: number;
  rating_max?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    per_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface ReviewStatsResponse {
  stats: ReviewStats;
}
