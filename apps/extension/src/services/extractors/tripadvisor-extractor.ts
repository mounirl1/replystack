import type { ExtractedReview, Platform } from '../../types/review';
import { BaseExtractor } from './base-extractor';

/**
 * Extractor for TripAdvisor reviews
 * Handles: tripadvisor.com/*, tripadvisor.fr/*, etc.
 */
export class TripAdvisorExtractor extends BaseExtractor {
  get platform(): Platform {
    return 'tripadvisor';
  }

  private selectors = {
    reviewContainer: [
      '[data-reviewid]',
      '[data-test-target="HR_CC_CARD"]',
      '.review-container',
      '[class*="reviewSelector"]',
      '.reviewCard',
    ],
    authorName: [
      '.member_info .username span',
      '.username',
      '[class*="username"]',
      '[class*="memberName"]',
      '.ui_header_link',
    ],
    authorAvatar: [
      '.member_info .avatar img',
      '.memberOverlayLink img',
      '[class*="avatar"] img',
    ],
    rating: [
      '.ui_bubble_rating',
      '[class*="bubble"]',
      '[data-test-target="review-rating"]',
      '[class*="rating"]',
    ],
    content: [
      '.entry .partial_entry',
      '.reviewText',
      '[class*="reviewText"]',
      '[data-test-target="review-body"]',
      '.prw_rup .text',
    ],
    date: [
      '.ratingDate',
      '[class*="ratingDate"]',
      '[class*="Date"]',
      'time',
    ],
    hasResponse: [
      '.mgrRspnInLine',
      '.mgmtResponse',
      '[class*="response"]',
      '[class*="ownerResponse"]',
    ],
  };

  getReviewElements(): Element[] {
    return this.querySelectorAllFallback(document, this.selectors.reviewContainer);
  }

  extractAll(): ExtractedReview[] {
    const elements = this.getReviewElements();
    console.log(`[TripAdvisorExtractor] Found ${elements.length} review elements`);

    return elements
      .map((el) => this.extractOne(el))
      .filter((review): review is ExtractedReview => review !== null);
  }

  private extractOne(el: Element): ExtractedReview | null {
    try {
      const externalId =
        el.getAttribute('data-reviewid') ||
        el.getAttribute('data-review-id') ||
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

      const rating = this.parseRatingFromBubbles(el);
      const dateStr = this.extractDateFromElement(el);
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
      console.error('[TripAdvisorExtractor] Failed to extract review:', e);
      return null;
    }
  }

  private parseRatingFromBubbles(el: Element): number {
    const bubbleEl = this.querySelectorFallback(el, this.selectors.rating);
    if (!bubbleEl) return 5;

    // TripAdvisor uses classes like "bubble_50" for 5 stars, "bubble_40" for 4 stars
    const className = bubbleEl.className;
    const match = className.match(/bubble_(\d)0/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Alternative: aria-label
    const ariaLabel = bubbleEl.getAttribute('aria-label') || '';
    const ariaMatch = ariaLabel.match(/(\d)/);
    if (ariaMatch) {
      return parseInt(ariaMatch[1], 10);
    }

    // Alternative: data attribute
    const dataRating = bubbleEl.getAttribute('data-value');
    if (dataRating) {
      return parseInt(dataRating, 10);
    }

    return 5;
  }

  private extractDateFromElement(el: Element): string {
    // TripAdvisor often has dates in specific formats
    const dateEl = this.querySelectorFallback(el, this.selectors.date);
    if (!dateEl) return '';

    // Check for title attribute (often contains full date)
    const titleDate = dateEl.getAttribute('title');
    if (titleDate) return titleDate;

    // Check for datetime attribute
    const dateTimeAttr = dateEl.getAttribute('datetime');
    if (dateTimeAttr) return dateTimeAttr;

    return dateEl.textContent?.trim() || '';
  }
}
