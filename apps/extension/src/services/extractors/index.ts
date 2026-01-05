import type { Platform } from '../../types/review';
import type { BaseExtractor } from './base-extractor';
import { GoogleExtractor } from './google-extractor';
import { TripAdvisorExtractor } from './tripadvisor-extractor';
import { BookingExtractor } from './booking-extractor';
import { YelpExtractor } from './yelp-extractor';

/**
 * Registry of platform extractors
 */
const extractors: Record<Platform, new () => BaseExtractor> = {
  google: GoogleExtractor,
  tripadvisor: TripAdvisorExtractor,
  booking: BookingExtractor,
  yelp: YelpExtractor,
  facebook: GoogleExtractor, // TODO: Create FacebookExtractor when API is available
};

/**
 * Create an extractor instance for a given platform
 */
export function getExtractor(platform: Platform): BaseExtractor | null {
  const ExtractorClass = extractors[platform];
  if (!ExtractorClass) {
    console.warn(`[Extractors] No extractor found for platform: ${platform}`);
    return null;
  }
  return new ExtractorClass();
}

/**
 * URL patterns for platform detection
 */
const platformPatterns: Array<{ platform: Platform; patterns: RegExp[] }> = [
  {
    platform: 'google',
    patterns: [
      /business\.google\.com/i,
      /google\.com\/business/i,
    ],
  },
  {
    platform: 'tripadvisor',
    patterns: [
      /tripadvisor\.[a-z]+/i,
      /tripadvisor\.com/i,
    ],
  },
  {
    platform: 'booking',
    patterns: [
      /admin\.booking\.com/i,
      /partner\.booking\.com/i,
    ],
  },
  {
    platform: 'yelp',
    patterns: [
      /biz\.yelp\.com/i,
      /yelp\.com\/biz/i,
    ],
  },
  {
    platform: 'facebook',
    patterns: [
      /business\.facebook\.com/i,
      /facebook\.com\/business/i,
    ],
  },
];

/**
 * Detect platform from URL
 */
export function detectPlatformFromUrl(url: string): Platform | null {
  for (const { platform, patterns } of platformPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return platform;
      }
    }
  }
  return null;
}

/**
 * Check if the current page is a review management page
 */
export function isReviewPage(url: string): boolean {
  const lowerUrl = url.toLowerCase();

  // Check for common review page patterns
  const reviewPatterns = [
    /\/reviews?/i,
    /\/avis/i,            // French
    /\/bewertungen/i,     // German
    /\/rese[ñn]as/i,      // Spanish
    /\/recensioni/i,      // Italian
    /guest.*review/i,
    /manage.*review/i,
  ];

  return reviewPatterns.some(pattern => pattern.test(lowerUrl));
}

// Re-export types and classes
export { BaseExtractor } from './base-extractor';
export { GoogleExtractor } from './google-extractor';
export { TripAdvisorExtractor } from './tripadvisor-extractor';
export { BookingExtractor } from './booking-extractor';
export { YelpExtractor } from './yelp-extractor';
