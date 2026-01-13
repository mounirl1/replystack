import type { ExtractedReview, Platform } from '../../types/review';
import { BaseExtractor } from './base-extractor';

/**
 * Extractor for Google Business Profile reviews
 * Handles: business.google.com reviews pages
 * Updated selectors based on current Google Business DOM structure (2024)
 */
export class GoogleExtractor extends BaseExtractor {
  get platform(): Platform {
    return 'google';
  }

  // Updated selectors matching current Google Business Profile DOM structure
  private selectors = {
    reviewContainer: [
      '.DsOcnf',                    // Main review container with key attribute
      '[jscontroller="H8pyme"]',   // Review controller element
      '.OUCuxb',                   // Inner wrapper
    ],
    authorName: [
      'a.bFubHb',                  // Author link (primary)
      '.bFubHb',                   // Author without link
      '.z2S9Hc a',                 // Alternative structure
    ],
    authorAvatar: [
      'img.ntwMne',                // Google avatar image
      '.HuyArc img',               // Avatar container fallback
      '.DeOCrd img',               // Alternative avatar container
    ],
    content: [
      '.oiQd1c[jsname="QUIPvd"]',  // Full text (may be hidden for long reviews)
      '.oiQd1c',                   // Visible text span
      '.arx7af[jsname="an9Zef"]',  // Truncated text with "Plus" link
      '.arx7af',                   // Truncated text
      '.DYAZaf span',              // Fallback content container
    ],
    date: [
      '.Wxf3Bf.wUfJz',             // Review date (e.g., "Il y a 22 semaines")
      '.TkmEd .Wxf3Bf',            // Date in rating section
      '.wUfJz',                    // Generic date class
    ],
    rating: [
      '.YMWsEc .DPvwYc.z3FsAc',    // Filled stars in rating container
      '.DPvwYc.z3FsAc',            // Filled star (has z3FsAc class)
    ],
    ownerResponse: [
      'div.Rhj72c',                // Owner response container
      '.Rhj72c',                   // Fallback
    ],
    responseContent: [
      'div.DT6Wnd',                // Response text content
      '.Q9ktHb .DT6Wnd',           // Response in blockquote
      '.BNyFuc .DT6Wnd',           // Alternative path
    ],
    noTextIndicator: [
      '.amKOJf.kIqwof',            // "L'utilisateur n'a pas rédigé d'avis"
    ],
  };

  getReviewElements(): Element[] {
    // Get containers - prefer .DsOcnf as it has the key attribute
    const containers = document.querySelectorAll('.DsOcnf');
    if (containers.length > 0) {
      return Array.from(containers);
    }
    // Fallback to other selectors
    return this.querySelectorAllFallback(document, this.selectors.reviewContainer);
  }

  /**
   * Expand all truncated reviews by clicking "Plus" buttons
   */
  async expandAllReviews(): Promise<void> {
    const expandButtons = document.querySelectorAll(
      'button.review-more-link, ' +
      '.arx7af button, ' +
      'button[jsaction*="expand"], ' +
      '.DYAZaf button'
    );

    // Also try links with "Plus" or "More" text
    const allClickables = document.querySelectorAll('.arx7af *, .DYAZaf *');
    const expandLinks: Element[] = [];

    allClickables.forEach((el) => {
      const text = el.textContent?.trim().toLowerCase() || '';
      if (
        (text === 'plus' || text === 'more' || text === 'voir plus' || text === 'lire la suite') &&
        (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN')
      ) {
        expandLinks.push(el);
      }
    });

    const allButtons = [...Array.from(expandButtons), ...expandLinks];

    if (allButtons.length > 0) {
      for (const btn of allButtons) {
        try {
          (btn as HTMLElement).click();
        } catch {
          // Ignore click errors
        }
      }

      // Wait for DOM to update
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  extractAll(): ExtractedReview[] {
    const elements = this.getReviewElements();

    const reviews = elements
      .map((el) => this.extractOne(el))
      .filter((review): review is ExtractedReview => review !== null);

    return reviews;
  }

  /**
   * Extract all reviews after expanding truncated content
   * Overrides base class to handle "Plus..." expansion
   */
  override async extractAllAsync(): Promise<ExtractedReview[]> {
    // First expand all truncated reviews
    await this.expandAllReviews();

    // Then extract
    return this.extractAll();
  }

  private extractOne(el: Element): ExtractedReview | null {
    try {
      // External ID from key attribute on container
      const externalId =
        el.getAttribute('key') ||
        el.getAttribute('data-review-id') ||
        this.generateFallbackId({
          authorName: this.extractAuthorName(el),
          content: this.extractContent(el),
        });

      const authorName = this.extractAuthorName(el) || 'Anonymous';
      const content = this.extractContent(el);

      // Check if this is a "no text" review
      const noTextEl = this.querySelectorFallback(el, this.selectors.noTextIndicator);
      const isNoTextReview = !!noTextEl;

      // Skip if no meaningful content and not a "stars only" review
      if (!content && !authorName && !isNoTextReview) {
        return null;
      }

      const avatarEl = this.querySelectorFallback(el, this.selectors.authorAvatar) as HTMLImageElement | null;
      const authorAvatar = avatarEl?.src;

      const rating = this.parseRatingFromElement(el);
      const dateStr = this.extractText(el, this.selectors.date);
      const publishedAt = this.parseDate(dateStr);

      // Extract owner response
      const responseContainer = this.querySelectorFallback(el, this.selectors.ownerResponse);
      const hasResponse = !!responseContainer;
      let responseContent: string | undefined;

      if (responseContainer) {
        const responseTextEl = this.querySelectorFallback(responseContainer, this.selectors.responseContent);
        if (responseTextEl) {
          responseContent = this.cleanText(responseTextEl.textContent || '');
        }
      }

      const language = content ? this.detectLanguage(content) : undefined;

      return {
        externalId,
        authorName,
        authorAvatar,
        rating,
        content,
        language,
        publishedAt,
        hasResponse,
        responseContent,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract author name from review element
   */
  private extractAuthorName(el: Element): string {
    const authorEl = this.querySelectorFallback(el, this.selectors.authorName);
    return authorEl?.textContent?.trim() || '';
  }

  /**
   * Extract review content, handling both full and truncated text
   */
  private extractContent(el: Element): string {
    // First try to get the full text (may be hidden)
    const fullTextEl = el.querySelector('.oiQd1c[jsname="QUIPvd"]');
    if (fullTextEl) {
      const text = fullTextEl.textContent?.trim() || '';
      if (text) {
        return this.cleanText(text);
      }
    }

    // Try visible text
    const visibleTextEl = el.querySelector('.oiQd1c');
    if (visibleTextEl) {
      const text = visibleTextEl.textContent?.trim() || '';
      if (text) {
        return this.cleanText(text);
      }
    }

    // Try truncated text (remove "Plus" link text)
    const truncatedEl = el.querySelector('.arx7af');
    if (truncatedEl) {
      let text = truncatedEl.textContent?.trim() || '';
      // Remove "Plus" or "More" link text at the end
      text = text.replace(/\s*(Plus|More|Voir plus|Lire la suite)\s*$/i, '');
      return this.cleanText(text);
    }

    // Fallback to DYAZaf container
    const fallbackEl = el.querySelector('.DYAZaf span');
    if (fallbackEl) {
      return this.cleanText(fallbackEl.textContent || '');
    }

    return '';
  }

  /**
   * Parse rating by counting filled stars
   */
  private parseRatingFromElement(el: Element): number {
    // Count filled stars (they have the z3FsAc class indicating they're filled)
    const filledStars = el.querySelectorAll('.DPvwYc.z3FsAc');
    if (filledStars.length > 0 && filledStars.length <= 5) {
      return filledStars.length;
    }

    // Alternative: try to find rating container and count stars there
    const ratingContainer = el.querySelector('.YMWsEc');
    if (ratingContainer) {
      const stars = ratingContainer.querySelectorAll('.DPvwYc.z3FsAc');
      if (stars.length > 0 && stars.length <= 5) {
        return stars.length;
      }
    }

    // Fallback: check aria-label on rating elements
    const ratingEl = el.querySelector('[aria-label*="star"], [aria-label*="étoile"]');
    if (ratingEl) {
      const ariaLabel = ratingEl.getAttribute('aria-label') || '';
      const match = ariaLabel.match(/(\d)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Default to 5 stars if parsing fails
    return 5;
  }
}
