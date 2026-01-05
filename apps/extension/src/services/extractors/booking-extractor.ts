import type { ExtractedReview, Platform } from '../../types/review';
import { BaseExtractor } from './base-extractor';

/**
 * Extractor for Booking.com Partner Central reviews
 * Handles: admin.booking.com/*
 */
export class BookingExtractor extends BaseExtractor {
  get platform(): Platform {
    return 'booking';
  }

  private selectors = {
    reviewContainer: [
      '[data-review-id]',
      '.review-card',
      '[class*="guest-review"]',
      '[class*="review-item"]',
      '.bui-card',
    ],
    authorName: [
      '.guest-name',
      '[class*="guest-name"]',
      '[class*="reviewer-name"]',
      '.review-author',
      '[data-testid="guest-name"]',
    ],
    authorAvatar: [
      '.guest-avatar img',
      '[class*="avatar"] img',
    ],
    rating: [
      '.review-score',
      '[class*="review-score"]',
      '[class*="rating-score"]',
      '[data-testid="review-score"]',
      '.bui-review-score__badge',
    ],
    content: [
      '.review-text',
      '[class*="review-text"]',
      '[class*="review-content"]',
      '.review-body',
      '[data-testid="review-text"]',
    ],
    positiveContent: [
      '.review-positive',
      '[class*="positive"]',
      '[data-testid="positive-text"]',
    ],
    negativeContent: [
      '.review-negative',
      '[class*="negative"]',
      '[data-testid="negative-text"]',
    ],
    date: [
      '.review-date',
      '[class*="review-date"]',
      '[class*="date"]',
      'time',
    ],
    hasResponse: [
      '.hotel-response',
      '[class*="response"]',
      '[class*="reply"]',
      '[data-testid="hotel-response"]',
    ],
  };

  getReviewElements(): Element[] {
    return this.querySelectorAllFallback(document, this.selectors.reviewContainer);
  }

  extractAll(): ExtractedReview[] {
    const elements = this.getReviewElements();
    console.log(`[BookingExtractor] Found ${elements.length} review elements`);

    return elements
      .map((el) => this.extractOne(el))
      .filter((review): review is ExtractedReview => review !== null);
  }

  private extractOne(el: Element): ExtractedReview | null {
    try {
      const externalId =
        el.getAttribute('data-review-id') ||
        el.getAttribute('data-id') ||
        el.id ||
        this.generateFallbackId({
          authorName: this.extractText(el, this.selectors.authorName),
          content: this.extractText(el, this.selectors.content),
        });

      const authorName = this.extractText(el, this.selectors.authorName) || 'Anonymous';

      // Booking.com often separates positive and negative feedback
      let content = this.cleanText(this.extractText(el, this.selectors.content));

      if (!content) {
        const positive = this.extractText(el, this.selectors.positiveContent);
        const negative = this.extractText(el, this.selectors.negativeContent);

        const parts: string[] = [];
        if (positive) parts.push(`+: ${positive}`);
        if (negative) parts.push(`-: ${negative}`);
        content = parts.join(' | ');
      }

      if (!content && !authorName) {
        return null;
      }

      const avatarEl = this.querySelectorFallback(el, this.selectors.authorAvatar) as HTMLImageElement | null;
      const authorAvatar = avatarEl?.src;

      const rating = this.parseRatingScore(el);
      const dateStr = this.extractText(el, this.selectors.date);
      const publishedAt = this.parseDate(dateStr);
      const hasResponse = !!this.querySelectorFallback(el, this.selectors.hasResponse);

      const language = this.detectLanguage(content);

      return {
        externalId,
        authorName,
        authorAvatar,
        rating,
        content,
        language,
        publishedAt,
        hasResponse,
      };
    } catch (e) {
      console.error('[BookingExtractor] Failed to extract review:', e);
      return null;
    }
  }

  private parseRatingScore(el: Element): number {
    const scoreEl = this.querySelectorFallback(el, this.selectors.rating);
    if (!scoreEl) return 8; // Booking default mid-range

    // Booking uses 1-10 scale, we convert to 1-5
    const scoreText = scoreEl.textContent?.trim() || '';
    const scoreMatch = scoreText.match(/(\d+\.?\d*)/);

    if (scoreMatch) {
      const score10 = parseFloat(scoreMatch[1]);
      // Convert 1-10 to 1-5
      return Math.round(score10 / 2);
    }

    // Try data attribute
    const dataScore = scoreEl.getAttribute('data-score') || scoreEl.getAttribute('data-rating');
    if (dataScore) {
      const score10 = parseFloat(dataScore);
      return Math.round(score10 / 2);
    }

    return 4; // Default to 4/5 (good)
  }
}
