import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog/types';
import { formatBlogDate, getBlogUrl, getCategoryColor } from '@/lib/blog/utils';

type Variant = 'default' | 'featured' | 'compact';

interface BlogCardProps {
  post: BlogPostMeta;
  variant?: Variant;
}

export function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const { t, i18n } = useTranslation('blog');
  const url = getBlogUrl(post.slug, post.language);
  const formattedDate = formatBlogDate(post.date, i18n.language);

  if (variant === 'featured') {
    return (
      <article className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <Link to={url} className="block">
          {/* Featured image */}
          {post.featuredImage && (
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.featuredImage.src}
                alt={post.featuredImage.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}

          <div className="p-6">
            {/* Category badge */}
            <span
              className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}
            >
              {t(`categories.${post.category}`)}
            </span>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mt-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mt-2 line-clamp-2">{post.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{t('article.readingTime', { minutes: post.readingTime })}</span>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                {post.author.role && (
                  <p className="text-xs text-gray-500">{post.author.role}</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
        <Link to={url} className="flex gap-4 w-full">
          {/* Thumbnail */}
          {post.featuredImage && (
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={post.featuredImage.src}
                alt={post.featuredImage.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{formattedDate}</span>
              <span>{t('article.readingTime', { minutes: post.readingTime })}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={url} className="block">
        {/* Image */}
        {post.featuredImage && (
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={post.featuredImage.src}
              alt={post.featuredImage.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-5">
          {/* Category */}
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}
          >
            {t(`categories.${post.category}`)}
          </span>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mt-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.description}</p>

          {/* Meta */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>{formattedDate}</span>
            <span>{t('article.readingTime', { minutes: post.readingTime })}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default BlogCard;
