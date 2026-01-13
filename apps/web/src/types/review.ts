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
  // Existing response (scraped from platform)
  has_response: boolean;
  response_content?: string;
  response_published_at?: string;
  location: ReviewLocation;
  responses_count: number;
  latest_response?: ReviewResponse;
  can_publish_via_api: boolean;
  platform_url?: string | null;
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

export type ContentFilter = 'all' | 'with_text' | 'without_text';

export interface ReviewFilters {
  location_id?: number;
  platform?: Platform[];
  status?: ReviewStatus[];
  ratings?: number[];
  date_from?: string;
  date_to?: string;
  search?: string;
  has_content?: ContentFilter;
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    path: string;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ReviewStatsResponse {
  stats: ReviewStats;
}

export interface ReviewSummary {
  id: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  review_count: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}
