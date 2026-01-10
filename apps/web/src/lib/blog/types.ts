import type { ComponentType } from 'react';

// Supported blog languages
export type SupportedBlogLanguage = 'en' | 'fr' | 'es' | 'pt';

// Blog categories
export type BlogCategory =
  | 'guides'
  | 'tips'
  | 'case-studies'
  | 'news'
  | 'product-updates';

// Author information
export interface BlogAuthor {
  name: string;
  avatar?: string;
  role?: string;
}

// Featured image
export interface BlogFeaturedImage {
  src: string;
  alt: string;
  caption?: string;
}

// SEO overrides
export interface BlogSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

// Frontmatter from MDX files
export interface BlogFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string; // ISO format: "2024-01-15"
  author: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  featuredImage?: BlogFeaturedImage;
  seo?: BlogSEO;
  draft?: boolean;
  publishedAt?: string;
  updatedAt?: string;
}

// Table of contents item
export interface TableOfContentsItem {
  id: string;
  text: string;
  level: 2 | 3;
}

// Full blog post with computed fields
export interface BlogPost extends BlogFrontmatter {
  // Content component from MDX
  content: ComponentType;
  // Language of this version
  language: SupportedBlogLanguage;
  // Available translations
  availableLanguages: SupportedBlogLanguage[];
  // Computed reading time in minutes
  readingTime: number;
  // Word count
  wordCount: number;
  // Extracted headings for TOC
  headings: TableOfContentsItem[];
  // Raw content for search indexing
  rawContent?: string;
}

// Blog post metadata (without content, for listings)
export interface BlogPostMeta
  extends Omit<BlogPost, 'content' | 'rawContent' | 'headings'> {}

// Pagination
export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Blog filters
export interface BlogFilters {
  category?: BlogCategory;
  tag?: string;
  search?: string;
  language: SupportedBlogLanguage;
}

// Blog listing response
export interface BlogListingResponse {
  posts: BlogPostMeta[];
  pagination: BlogPagination;
  filters: BlogFilters;
}
