/**
 * Represents a review extracted from a platform's DOM
 */
export interface ExtractedReview {
  externalId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  content: string;
  language?: string;
  publishedAt: string; // ISO format
  hasResponse: boolean;
}

/**
 * Supported review platforms
 */
export type Platform = 'google' | 'tripadvisor' | 'booking' | 'yelp' | 'facebook';

/**
 * Represents a task for extracting reviews from a platform
 * Used for auto-extraction on paid plans
 */
export interface ExtractionTask {
  locationId: number;
  locationName: string;
  platform: Platform;
  managementUrl: string;
  lastFetchedAt: string | null;
}

/**
 * Result of syncing reviews with the backend
 */
export interface SyncResult {
  created: number;
  updated: number;
  unchanged: number;
}

/**
 * Location data cached in extension storage
 */
export interface CachedLocation {
  id: number;
  name: string;
  google_place_id?: string;
  facebook_page_id?: string;
  tripadvisor_management_url?: string;
  booking_management_url?: string;
  yelp_management_url?: string;
}

/**
 * Message types for extraction communication
 */
export interface ExtractionRequestMessage {
  type: 'REQUEST_EXTRACTION';
  platform: Platform;
  locationId: number;
  autoExtraction: boolean;
}

export interface ExtractionCompleteMessage {
  type: 'EXTRACTION_COMPLETE';
  result: SyncResult;
  autoExtraction: boolean;
}

export type ExtractionMessage = ExtractionRequestMessage | ExtractionCompleteMessage;
