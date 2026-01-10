import type {
  BlogPost,
  BlogPostMeta,
  SupportedBlogLanguage,
  BlogCategory,
} from './types';

const BASE_URL = 'https://replystack.io';

/**
 * Generate BlogPosting structured data for an article
 */
export function getBlogPostingSchema(post: BlogPost | BlogPostMeta): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.featuredImage?.src
      ? `${BASE_URL}${post.featuredImage.src}`
      : undefined,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.role && { jobTitle: post.author.role }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'ReplyStack',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    wordCount: post.wordCount,
    articleSection: post.category,
    keywords: post.tags.join(', '),
    inLanguage: post.language,
  };
}

/**
 * Generate Blog structured data for the listing page
 */
export function getBlogListingSchema(posts: BlogPostMeta[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ReplyStack Blog',
    description:
      'Tips, guides, and insights on AI-powered review management',
    url: `${BASE_URL}/blog`,
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE_URL}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };
}

/**
 * Format a date for display
 */
export function formatBlogDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get the blog URL for a specific language
 */
export function getBlogUrl(
  slug?: string,
  language: SupportedBlogLanguage = 'en'
): string {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  const path = slug ? `/blog/${slug}` : '/blog';
  return `${langPrefix}${path}`;
}

/**
 * Get language from URL path
 */
export function getLanguageFromPath(path: string): SupportedBlogLanguage {
  if (path.startsWith('/fr/')) return 'fr';
  if (path.startsWith('/es/')) return 'es';
  if (path.startsWith('/pt/')) return 'pt';
  return 'en';
}

/**
 * Extract slug from URL path
 */
export function getSlugFromPath(path: string): string | null {
  // Remove language prefix if present
  const cleanPath = path.replace(/^\/(fr|es|pt)\//, '/');
  const match = cleanPath.match(/^\/blog\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Remove consecutive dashes
    .trim();
}

/**
 * Calculate reading time from word count
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Get category color class
 */
export function getCategoryColor(category: BlogCategory): string {
  const colors: Record<BlogCategory, string> = {
    guides: 'bg-blue-100 text-blue-800',
    tips: 'bg-green-100 text-green-800',
    'case-studies': 'bg-purple-100 text-purple-800',
    news: 'bg-amber-100 text-amber-800',
    'product-updates': 'bg-emerald-100 text-emerald-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

/**
 * Get category label key for i18n
 */
export function getCategoryLabelKey(category: BlogCategory): string {
  return `blog:categories.${category}`;
}

/**
 * Sort posts by date (newest first)
 */
export function sortPostsByDate<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Filter posts by category
 */
export function filterByCategory<T extends { category: BlogCategory }>(
  posts: T[],
  category?: BlogCategory
): T[] {
  if (!category) return posts;
  return posts.filter((post) => post.category === category);
}

/**
 * Filter posts by tag
 */
export function filterByTag<T extends { tags: string[] }>(
  posts: T[],
  tag?: string
): T[] {
  if (!tag) return posts;
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get related posts based on category and tags
 */
export function getRelatedPosts<T extends BlogPostMeta>(
  currentPost: T,
  allPosts: T[],
  limit = 3
): T[] {
  const otherPosts = allPosts.filter((p) => p.slug !== currentPost.slug);

  // Score each post based on shared tags and same category
  const scored = otherPosts.map((post) => {
    let score = 0;
    if (post.category === currentPost.category) score += 2;
    const sharedTags = post.tags.filter((t) =>
      currentPost.tags.includes(t)
    ).length;
    score += sharedTags;
    return { post, score };
  });

  // Sort by score and take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((s) => s.score > 0)
    .map((s) => s.post);
}

/**
 * Paginate posts
 */
export function paginatePosts<T>(
  posts: T[],
  page: number,
  perPage: number
): { posts: T[]; totalPages: number } {
  const start = (page - 1) * perPage;
  const paginatedPosts = posts.slice(start, start + perPage);
  const totalPages = Math.ceil(posts.length / perPage);
  return { posts: paginatedPosts, totalPages };
}
