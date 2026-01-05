import type { ExtractedReview, Platform } from '../../types/review';
import { BaseExtractor } from './base-extractor';

/**
 * Extractor for Google Business Profile reviews
 * Handles: business.google.com reviews pages
 */
export class GoogleExtractor extends BaseExtractor {
  get platform(): Platform {
    return 'google';
  }

  // Multiple selectors for resilience to DOM changes
  private selectors = {
    reviewContainer: [
      '[data-review-id]',
      '.DsOcnf',
      '[jscontroller="H8pyme"]',
      '.review-card',
      '[class*="review-container"]',
    ],
    authorName: [
      '.YTvtJd',
      '.GYpYWe',
      '[class*="author"]',
      '[class*="reviewer-name"]',
      '.name',
    ],
    authorAvatar: [
      '.SLqwTc img',
      '[class*="avatar"] img',
      '[class*="profile-photo"] img',
    ],
    rating: [
      '[aria-label*="star"]',
      '[aria-label*="étoile"]',
      '.kvMYJc',
      '[class*="rating"]',
      '[class*="stars"]',
    ],
    content: [
      '.Jtu6Td',
      '.review-text',
      '[class*="review-content"]',
      '[class*="review-body"]',
      '.text',
    ],
    date: [
      '.dehysf',
      '[class*="review-date"]',
      '[class*="date"]',
      'time',
    ],
    hasResponse: [
      '.CDe7pd',
      '.owner-response',
      '[class*="response"]',
      '[class*="reply"]',
    ],
  };

  getReviewElements(): Element[] {
    return this.querySelectorAllFallback(document, this.selectors.reviewContainer);
  }

  extractAll(): ExtractedReview[] {
    const elements = this.getReviewElements();
    console.log(`[GoogleExtractor] Found ${elements.length} review elements`);

    return elements
      .map((el) => this.extractOne(el))
      .filter((review): review is ExtractedReview => review !== null);
  }

  private extractOne(el: Element): ExtractedReview | null {
    try {
      const externalId =
        el.getAttribute('data-review-id') ||
        el.getAttribute('data-reviewid') ||
        el.id ||
        this.generateFallbackId({
          authorName: this.extractText(el, this.selectors.authorName),
          content: this.extractText(el, this.selectors.content),
        });

      const authorName = this.extractText(el, this.selectors.authorName) || 'Anonymous';
      const content = this.cleanText(this.extractText(el, this.selectors.content));

      // Skip if no meaningful content
      if (!content && !authorName) {
        return null;
      }

      const avatarEl = this.querySelectorFallback(el, this.selectors.authorAvatar) as HTMLImageElement | null;
      const authorAvatar = avatarEl?.src;

      const rating = this.parseRatingFromElement(el);
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
      console.error('[GoogleExtractor] Failed to extract review:', e);
      return null;
    }
  }

  private parseRatingFromElement(el: Element): number {
    const ratingEl = this.querySelectorFallback(el, this.selectors.rating);
    if (!ratingEl) return 5;

    // Try aria-label first (e.g., "4 stars", "4 étoiles")
    const ariaLabel = ratingEl.getAttribute('aria-label') || '';
    const match = ariaLabel.match(/(\d)/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Try class-based rating (e.g., "rating-4", "stars-4")
    const className = ratingEl.className;
    const classMatch = className.match(/(?:rating|stars?)[-_]?(\d)/i);
    if (classMatch) {
      return parseInt(classMatch[1], 10);
    }

    // Count filled stars
    const filledStars = ratingEl.querySelectorAll(
      '[class*="filled"], [class*="full"], [class*="active"]'
    );
    if (filledStars.length > 0 && filledStars.length <= 5) {
      return filledStars.length;
    }

    // Google sometimes uses color to indicate rating
    const allStars = ratingEl.querySelectorAll('svg, span');
    let coloredStars = 0;
    allStars.forEach((star) => {
      const style = window.getComputedStyle(star);
      const color = style.color || style.fill;
      // Yellow/gold colors indicate filled stars
      if (color.includes('rgb(251') || color.includes('rgb(255') || color.includes('#fb') || color.includes('#ff')) {
        coloredStars++;
      }
    });
    if (coloredStars > 0 && coloredStars <= 5) {
      return coloredStars;
    }

    return 5; // Default to 5 stars if parsing fails
  }
}
