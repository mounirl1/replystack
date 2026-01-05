import type { ExtractedReview, Platform } from '../../types/review';

/**
 * Abstract base class for platform-specific review extractors.
 * Provides common utilities for DOM querying and data parsing.
 */
export abstract class BaseExtractor {
  /**
   * The platform this extractor handles
   */
  abstract get platform(): Platform;

  /**
   * Extract all reviews from the current page
   */
  abstract extractAll(): ExtractedReview[];

  /**
   * Get all review container elements on the page
   */
  abstract getReviewElements(): Element[];

  /**
   * Try multiple selectors and return the first matching element
   */
  protected querySelectorFallback(
    container: Element | Document,
    selectors: string[]
  ): Element | null {
    for (const selector of selectors) {
      try {
        const el = container.querySelector(selector);
        if (el) return el;
      } catch (e) {
        // Invalid selector, continue to next
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    return null;
  }

  /**
   * Try multiple selectors and return all matching elements
   */
  protected querySelectorAllFallback(
    container: Element | Document,
    selectors: string[]
  ): Element[] {
    for (const selector of selectors) {
      try {
        const elements = container.querySelectorAll(selector);
        if (elements.length > 0) return Array.from(elements);
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    return [];
  }

  /**
   * Extract text content from first matching element
   */
  protected extractText(
    container: Element | Document,
    selectors: string[]
  ): string {
    const el = this.querySelectorFallback(container, selectors);
    return el?.textContent?.trim() || '';
  }

  /**
   * Parse a date string to ISO format
   * Handles various formats including relative dates
   */
  protected parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    const now = new Date();
    const lowerStr = dateStr.toLowerCase().trim();

    // Handle relative dates in multiple languages
    const relativePatterns: Array<{
      pattern: RegExp;
      calculate: (match: RegExpMatchArray) => Date;
    }> = [
      // English patterns
      {
        pattern: /(\d+)\s*(second|sec)s?\s*ago/i,
        calculate: (m) => new Date(now.getTime() - parseInt(m[1]) * 1000),
      },
      {
        pattern: /(\d+)\s*(minute|min)s?\s*ago/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 60 * 1000),
      },
      {
        pattern: /(\d+)\s*(hour|hr)s?\s*ago/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 60 * 60 * 1000),
      },
      {
        pattern: /(\d+)\s*days?\s*ago/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /(\d+)\s*weeks?\s*ago/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /(\d+)\s*months?\s*ago/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - parseInt(m[1]));
          return date;
        },
      },
      {
        pattern: /(\d+)\s*years?\s*ago/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - parseInt(m[1]));
          return date;
        },
      },
      // French patterns
      {
        pattern: /il y a (\d+)\s*seconde/i,
        calculate: (m) => new Date(now.getTime() - parseInt(m[1]) * 1000),
      },
      {
        pattern: /il y a (\d+)\s*minute/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 60 * 1000),
      },
      {
        pattern: /il y a (\d+)\s*heure/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 60 * 60 * 1000),
      },
      {
        pattern: /il y a (\d+)\s*jour/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /il y a (\d+)\s*semaine/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /il y a (\d+)\s*mois/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - parseInt(m[1]));
          return date;
        },
      },
      {
        pattern: /il y a (\d+)\s*an/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setFullYear(date.getFullYear() - parseInt(m[1]));
          return date;
        },
      },
      // Spanish patterns
      {
        pattern: /hace (\d+)\s*día/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /hace (\d+)\s*semana/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /hace (\d+)\s*mes/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - parseInt(m[1]));
          return date;
        },
      },
      // German patterns
      {
        pattern: /vor (\d+)\s*tag/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /vor (\d+)\s*woche/i,
        calculate: (m) =>
          new Date(now.getTime() - parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000),
      },
      {
        pattern: /vor (\d+)\s*monat/i,
        calculate: (m) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - parseInt(m[1]));
          return date;
        },
      },
    ];

    // Try relative patterns
    for (const { pattern, calculate } of relativePatterns) {
      const match = lowerStr.match(pattern);
      if (match) {
        return calculate(match).toISOString();
      }
    }

    // Handle "yesterday", "today", etc.
    if (lowerStr.includes('today') || lowerStr.includes("aujourd'hui") || lowerStr.includes('hoy')) {
      return now.toISOString();
    }
    if (lowerStr.includes('yesterday') || lowerStr.includes('hier') || lowerStr.includes('ayer')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString();
    }

    // Try parsing as a standard date
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch {
      // Fall through to default
    }

    // Default to now if parsing fails
    return now.toISOString();
  }

  /**
   * Generate a unique ID for a review when no external ID is available
   */
  protected generateFallbackId(review: Partial<ExtractedReview>): string {
    const components = [
      review.authorName || 'unknown',
      review.rating?.toString() || '0',
      review.content?.substring(0, 50) || '',
      Date.now().toString(36),
    ];
    return btoa(components.join('|')).replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
  }

  /**
   * Detect language from text content (basic detection)
   */
  protected detectLanguage(text: string): string | undefined {
    if (!text || text.length < 10) return undefined;

    const patterns: Record<string, RegExp> = {
      fr: /\b(le|la|les|de|du|des|et|est|sont|nous|vous|merci|bonjour|très|avec)\b/gi,
      en: /\b(the|is|are|was|were|have|has|thank|hello|great|good|very|with)\b/gi,
      es: /\b(el|la|los|las|de|del|y|es|son|gracias|hola|muy|con)\b/gi,
      de: /\b(der|die|das|und|ist|sind|haben|danke|guten|sehr|mit)\b/gi,
      it: /\b(il|la|i|le|di|del|e|è|sono|grazie|buon|molto|con)\b/gi,
      pt: /\b(o|a|os|as|de|do|e|é|são|obrigado|muito|com)\b/gi,
    };

    const scores: Record<string, number> = {};
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      scores[lang] = matches?.length || 0;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore < 2) return undefined;

    const lang = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];
    return lang;
  }

  /**
   * Clean and normalize text content
   */
  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\n\r\t]/g, ' ')
      .trim();
  }
}
