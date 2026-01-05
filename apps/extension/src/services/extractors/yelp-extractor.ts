import type { ExtractedReview, Platform } from '../../types/review';
import { BaseExtractor } from './base-extractor';

/**
 * Extractor for Yelp for Business reviews
 * Handles: biz.yelp.com/*
 */
export class YelpExtractor extends BaseExtractor {
  get platform(): Platform {
    return 'yelp';
  }

  private selectors = {
    reviewContainer: [
      '[data-review-id]',
      '.review',
      '[class*="review-content"]',
      '.biz-review',
      '[data-testid="review"]',
    ],
    authorName: [
      '.user-name',
      '[class*="user-name"]',
      '[class*="reviewer-name"]',
      '.user-display-name',
      'a[href*="/user_details"]',
    ],
    authorAvatar: [
      '.user-photo img',
      '.photo-box img',
      '[class*="avatar"] img',
    ],
    rating: [
      '[aria-label*="star rating"]',
      '.i-stars',
      '[class*="star-rating"]',
      '[class*="i-stars"]',
      '[role="img"][aria-label*="star"]',
    ],
    content: [
      '.review-content p',
      '[class*="review-content"]',
      '.comment',
      '[lang] p',
      '.review-text',
    ],
    date: [
      '.rating-qualifier',
      '[class*="date"]',
      'time',
      '.review-date',
    ],
    hasResponse: [
      '.biz-owner-reply',
      '.business-owner-reply',
      '[class*="owner-reply"]',
      '[class*="response"]',
    ],
  };

  getReviewElements(): Element[] {
    return this.querySelectorAllFallback(document, this.selectors.reviewContainer);
  }

  extractAll(): ExtractedReview[] {
    const elements = this.getReviewElements();
    console.log(`[YelpExtractor] Found ${elements.length} review elements`);

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
      const content = this.cleanText(this.extractText(el, this.selectors.content));

      if (!content && !authorName) {
        return null;
      }

      const avatarEl = this.querySelectorFallback(el, this.selectors.authorAvatar) as HTMLImageElement | null;
      const authorAvatar = avatarEl?.src;

      const rating = this.parseRatingFromStars(el);
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
      console.error('[YelpExtractor] Failed to extract review:', e);
      return null;
    }
  }

  private parseRatingFromStars(el: Element): number {
    const ratingEl = this.querySelectorFallback(el, this.selectors.rating);
    if (!ratingEl) return 5;

    // Yelp uses aria-label like "5 star rating"
    const ariaLabel = ratingEl.getAttribute('aria-label') || '';
    const match = ariaLabel.match(/(\d)/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Alternative: class-based (e.g., "i-stars--regular-5")
    const className = ratingEl.className;
    const classMatch = className.match(/(?:stars?|rating)[-_]?(\d)/i);
    if (classMatch) {
      return parseInt(classMatch[1], 10);
    }

    // Alternative: title attribute
    const title = ratingEl.getAttribute('title') || '';
    const titleMatch = title.match(/(\d)/);
    if (titleMatch) {
      return parseInt(titleMatch[1], 10);
    }

    // Alternative: data attribute
    const dataRating = ratingEl.getAttribute('data-rating');
    if (dataRating) {
      return parseInt(dataRating, 10);
    }

    return 5;
  }
}
