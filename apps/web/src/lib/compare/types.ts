import type { ComponentType } from 'react';

// Supported languages for comparison pages
export type SupportedCompareLanguage = 'en' | 'fr' | 'es' | 'pt';

// Comparison article frontmatter
export interface CompareFrontmatter {
  title: string;
  slug: string;
  competitor: string; // e.g., "Birdeye", "Podium"
  metaTitle: string;
  metaDescription: string;
  date: string;
  updatedAt?: string;
  author?: {
    name: string;
    role?: string;
  };
  featuredImage?: {
    src: string;
    alt: string;
  };
  draft?: boolean;
}

// Table of contents item
export interface CompareTableOfContentsItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// Full comparison article
export interface CompareArticle extends CompareFrontmatter {
  content: ComponentType;
  language: SupportedCompareLanguage;
  availableLanguages: SupportedCompareLanguage[];
  readingTime: number;
  headings: CompareTableOfContentsItem[];
}

// Comparison article metadata (for listings)
export interface CompareArticleMeta
  extends Omit<CompareArticle, 'content' | 'headings'> {}
