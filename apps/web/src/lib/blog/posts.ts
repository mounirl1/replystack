import type { BlogPostMeta, SupportedBlogLanguage, BlogCategory } from './types';
import {
  sortPostsByDate,
  filterByCategory,
  filterByTag,
  paginatePosts,
} from './utils';

// This file will be the central registry for all blog posts
// Posts are imported statically for build-time optimization

// Sample posts data - in production, this would be generated from MDX files
// For now, we provide a structure that can be populated with actual content
const postsData: BlogPostMeta[] = [
  // Posts will be added here or imported from MDX files
];

// Store posts by language
const postsByLanguage: Record<SupportedBlogLanguage, BlogPostMeta[]> = {
  en: [],
  fr: [],
  es: [],
  pt: [],
};

// Initialize posts by language
postsData.forEach((post) => {
  if (postsByLanguage[post.language]) {
    postsByLanguage[post.language].push(post);
  }
});

/**
 * Get all posts for a language
 */
export function getAllPosts(language: SupportedBlogLanguage): BlogPostMeta[] {
  return sortPostsByDate(postsByLanguage[language] || []);
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(
  slug: string,
  language: SupportedBlogLanguage
): BlogPostMeta | undefined {
  return postsByLanguage[language]?.find((post) => post.slug === slug);
}

/**
 * Get posts with filters and pagination
 */
export function getPosts(options: {
  language: SupportedBlogLanguage;
  category?: BlogCategory;
  tag?: string;
  page?: number;
  perPage?: number;
}): {
  posts: BlogPostMeta[];
  totalPages: number;
  totalPosts: number;
} {
  const { language, category, tag, page = 1, perPage = 12 } = options;

  let posts = getAllPosts(language);

  // Apply filters
  posts = filterByCategory(posts, category);
  posts = filterByTag(posts, tag);

  const totalPosts = posts.length;

  // Paginate
  const { posts: paginatedPosts, totalPages } = paginatePosts(posts, page, perPage);

  return {
    posts: paginatedPosts,
    totalPages,
    totalPosts,
  };
}

/**
 * Get all unique tags
 */
export function getAllTags(language: SupportedBlogLanguage): string[] {
  const posts = getAllPosts(language);
  const tags = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

/**
 * Get all categories with post counts
 */
export function getCategoriesWithCounts(
  language: SupportedBlogLanguage
): Record<BlogCategory, number> {
  const posts = getAllPosts(language);
  const counts: Record<BlogCategory, number> = {
    guides: 0,
    tips: 0,
    'case-studies': 0,
    news: 0,
    'product-updates': 0,
  };

  posts.forEach((post) => {
    if (counts[post.category] !== undefined) {
      counts[post.category]++;
    }
  });

  return counts;
}

/**
 * Register a new post (called during build/import)
 */
export function registerPost(post: BlogPostMeta): void {
  if (!postsByLanguage[post.language]) {
    postsByLanguage[post.language] = [];
  }
  // Avoid duplicates
  const existing = postsByLanguage[post.language].findIndex(
    (p) => p.slug === post.slug
  );
  if (existing === -1) {
    postsByLanguage[post.language].push(post);
  } else {
    postsByLanguage[post.language][existing] = post;
  }
}

/**
 * Check if any posts exist
 */
export function hasPosts(language: SupportedBlogLanguage): boolean {
  return (postsByLanguage[language]?.length || 0) > 0;
}
