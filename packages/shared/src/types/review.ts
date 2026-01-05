import type { Platform } from '../constants/platforms';

export type ReviewStatus = 'pending' | 'replied' | 'ignored';

export interface Review {
  id: number;
  location_id: number;
  platform: Platform;
  external_id: string;
  author_name: string;
  author_avatar: string | null;
  rating: number;
  content: string;
  language: string | null;
  published_at: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithLocation extends Review {
  location: {
    id: number;
    name: string;
  };
}

export interface ReviewsListResponse {
  data: ReviewWithLocation[];
  next_cursor: string | null;
  has_more: boolean;
}
