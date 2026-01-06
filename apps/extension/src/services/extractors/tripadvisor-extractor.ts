import type { ExtractedReview, Platform } from '@/types/review';
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
      // New management interface
      'button.onXpl',
      '.onXpl',
      // Legacy selectors
      '[data-reviewid]',
      '[data-test-target="HR_CC_CARD"]',
      '.review-container',
      '[class*="reviewSelector"]',
      '.reviewCard',
    ],
    // Legacy author selectors
    authorName: [
      '.member_info .username span',
      '.username',
      '[class*="username"]',
      '[class*="memberName"]',
      '.ui_header_link',
    ],
    // New interface author selectors
    authorNameNew: ['.YLwnJ .biGQs'],
    authorAvatar: [
      '.member_info .avatar img',
      '.memberOverlayLink img',
      '[class*="avatar"] img',
      '.xqWFK', // New interface
    ],
    rating: [
      '.ui_bubble_rating',
      '[class*="bubble"]',
      '[data-test-target="review-rating"]',
      '[class*="rating"]',
    ],
    // New interface rating selector
    ratingNew: ['svg.UctUV title'],
    content: [
      '.entry .partial_entry',
      '.reviewText',
      '[class*="reviewText"]',
      '[data-test-target="review-body"]',
      '.prw_rup .text',
    ],
    // New interface content selectors
    contentTitleNew: ['.DyFaS .OgHoE .q', '.DyFaS .biGQs.SewaP.OgHoE .q'],
    contentTextNew: ['.DyFaS .AWdfh .q', '.DyFaS .biGQs.VImYz.AWdfh .q'],
    date: [
      '.ratingDate',
      '[class*="ratingDate"]',
      '[class*="Date"]',
      'time',
    ],
    // New interface date selector
    dateNew: ['.YLwnJ .biGQs.SewaP.xENVe', '.pChLG .xENVe'],
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
      // Check if this is the new management interface
      const isNewInterface = el.classList.contains('onXpl');

      let authorName: string;
      let content: string;
      let rating: number;
      let dateStr: string;

      if (isNewInterface) {
        // New management interface extraction
        authorName = this.extractText(el, this.selectors.authorNameNew) || 'Anonymous';

        // Extract rating from SVG title like "5.0 of 5 bubbles"
        const svgTitle = this.querySelectorFallback(el, this.selectors.ratingNew);
        if (svgTitle?.textContent) {
          const match = svgTitle.textContent.match(/(\d+\.?\d*)\s*of\s*5/);
          if (match) {
            rating = Math.round(parseFloat(match[1]));
          }
        }

        // Extract content (title + text)
        const titleText = this.extractText(el, this.selectors.contentTitleNew) || '';
        const contentText = this.extractText(el, this.selectors.contentTextNew) || '';
        content = this.cleanText(titleText ? `${titleText}\n${contentText}` : contentText);

        // Extract date
        dateStr = this.extractText(el, this.selectors.dateNew) || '';
      } else {
        // Legacy extraction
        authorName = this.extractText(el, this.selectors.authorName) || 'Anonymous';
        content = this.cleanText(this.extractText(el, this.selectors.content));
        rating = this.parseRatingFromBubbles(el);
        dateStr = this.extractDateFromElement(el);
      }

      const externalId =
        el.getAttribute('data-reviewid') ||
        el.getAttribute('data-review-id') ||
        el.id ||
        this.generateFallbackId({
          authorName,
          content,
        });

      if (!content && !authorName) {
        return null;
      }

      const avatarEl = this.querySelectorFallback(el, this.selectors.authorAvatar) as HTMLImageElement | null;
      const authorAvatar = avatarEl?.src;

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
