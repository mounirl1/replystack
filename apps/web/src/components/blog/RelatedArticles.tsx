import { useTranslation } from 'react-i18next';
import type { BlogPostMeta } from '@/lib/blog/types';
import { BlogCard } from './BlogCard';

interface RelatedArticlesProps {
  posts: BlogPostMeta[];
  className?: string;
}

export function RelatedArticles({ posts, className = '' }: RelatedArticlesProps) {
  const { t } = useTranslation('blog');

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('article.relatedArticles')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
