import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MDXProvider } from '@mdx-js/react';
import { Calendar, Clock, ArrowLeft, Globe } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';
import { mdxComponents } from '@/components/blog/MDXComponents';
import { TableOfContents, useTableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { getPostBySlug, getAllPosts } from '@/lib/blog/posts';
import {
  getLanguageFromPath,
  getBlogUrl,
  formatBlogDate,
  getBlogPostingSchema,
  getCategoryColor,
  getRelatedPosts,
} from '@/lib/blog/utils';
import type { SupportedBlogLanguage } from '@/lib/blog/types';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation('blog');
  const location = useLocation();

  // Get language from URL path
  const language = getLanguageFromPath(location.pathname) as SupportedBlogLanguage;

  // Get the post
  const post = slug ? getPostBySlug(slug, language) : undefined;

  // Get headings for TOC
  const headings = useTableOfContents();

  // 404 if not found
  if (!slug || !post) {
    return <Navigate to={getBlogUrl(undefined, language)} replace />;
  }

  // Get related posts
  const allPosts = getAllPosts(language);
  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  // Full URL for sharing
  const fullUrl = `https://replystack.io${getBlogUrl(post.slug, language)}`;

  // Format date
  const formattedDate = formatBlogDate(post.date, i18n.language);

  return (
    <>
      <PageSEO
        title={post.seo?.title || `${post.title} | ReplyStack Blog`}
        description={post.seo?.description || post.description}
        canonicalPath={getBlogUrl(post.slug, language)}
        ogType="article"
        ogImage={post.featuredImage?.src}
        structuredData={getBlogPostingSchema(post)}
        includeHreflang
      />

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back link */}
            <Link
              to={getBlogUrl(undefined, language)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} />
              {t('article.backToBlog', { defaultValue: 'Back to Blog' })}
            </Link>

            {/* Category */}
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}
            >
              {t(`categories.${post.category}`)}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mt-4">{post.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500">
              {/* Author */}
              <div className="flex items-center gap-2">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-gray-900">{post.author.name}</span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>

              {/* Reading time */}
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{t('article.readingTime', { minutes: post.readingTime })}</span>
              </div>
            </div>

            {/* Available languages */}
            {post.availableLanguages.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                <Globe size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {t('article.availableIn')}
                </span>
                <div className="flex gap-2">
                  {post.availableLanguages
                    .filter((lang) => lang !== language)
                    .map((lang) => (
                      <Link
                        key={lang}
                        to={getBlogUrl(post.slug, lang)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        {lang.toUpperCase()}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
            <figure>
              <img
                src={post.featuredImage.src}
                alt={post.featuredImage.alt}
                className="w-full rounded-2xl shadow-lg"
              />
              {post.featuredImage.caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-3">
                  {post.featuredImage.caption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-12">
            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              <MDXProvider components={mdxComponents}>
                <div className="prose prose-lg max-w-none">
                  {/* Content would be rendered here from MDX */}
                  <p className="text-gray-500 italic">
                    {/* Placeholder - actual MDX content goes here */}
                    Article content will be rendered from MDX file.
                  </p>
                </div>
              </MDXProvider>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`${getBlogUrl(undefined, language)}?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <ShareButtons
                  url={fullUrl}
                  title={post.title}
                />
              </div>

              {/* Author bio */}
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-start gap-4">
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{post.author.name}</p>
                    {post.author.role && (
                      <p className="text-sm text-gray-600">{post.author.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - TOC */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>

          {/* Related articles */}
          {relatedPosts.length > 0 && (
            <RelatedArticles posts={relatedPosts} className="mt-16 pt-16 border-t border-gray-100" />
          )}
        </div>
      </article>
    </>
  );
}

export default BlogPost;
