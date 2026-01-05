import type { Tone } from '../constants/platforms';

export interface Response {
  id: number;
  review_id: number;
  user_id: number;
  content: string;
  tone: Tone;
  language: string;
  is_published: boolean;
  published_at: string | null;
  generation_time_ms: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface GenerateReplyRequest {
  review_content: string;
  review_rating: number;
  review_author: string;
  platform: string;
  tone?: Tone;
  language?: string;
  location_id?: number;
}

export interface GenerateReplyResponse {
  reply: string;
  tone: Tone;
  language: string;
  tokens_used: number;
  quota_remaining: number | 'unlimited';
}
