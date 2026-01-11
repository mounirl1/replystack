import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';
import { BlogList } from '@/components/blog/BlogList';
import { getPosts, getCategoriesWithCounts, hasPosts } from '@/lib/blog/posts';
import { getBlogListingSchema } from '@/lib/blog/utils';
import type { BlogCategory, SupportedBlogLanguage, BlogPagination } from '@/lib/blog/types';

const POSTS_PER_PAGE = 12;

export function BlogIndex() {
  const { t, i18n } = useTranslation('blog');
  const [searchParams, setSearchParams] = useSearchParams();

  // Get language from i18n (responds to language selector changes)
  const language = (i18n.language?.split('-')[0] || 'en') as SupportedBlogLanguage;

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentCategory = searchParams.get('category') as BlogCategory | undefined;
  const searchQuery = searchParams.get('q') || '';

  // Local search state
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Get posts with filters
  const { posts, totalPages, totalPosts } = useMemo(
    () =>
      getPosts({
        language,
        category: currentCategory,
        page: currentPage,
        perPage: POSTS_PER_PAGE,
      }),
    [language, currentCategory, currentPage]
  );

  // Filter by search query (client-side)
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  // Get categories with counts
  const categoriesWithCounts = useMemo(
    () => getCategoriesWithCounts(language),
    [language]
  );

  // Pagination object
  const pagination: BlogPagination = {
    currentPage,
    totalPages,
    totalPosts,
    postsPerPage: POSTS_PER_PAGE,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  // Handlers
  const handlePageChange = (page: number) => {
    setSearchParams((params) => {
      params.set('page', page.toString());
      return params;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: BlogCategory | null) => {
    setSearchParams((params) => {
      if (category) {
        params.set('category', category);
      } else {
        params.delete('category');
      }
      params.delete('page'); // Reset to first page
      return params;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((params) => {
      if (searchInput.trim()) {
        params.set('q', searchInput.trim());
      } else {
        params.delete('q');
      }
      params.delete('page');
      return params;
    });
  };

  // Check if blog has content
  const hasContent = hasPosts(language);

  return (
    <>
      <PageSEO
        title={t('seo.title', { defaultValue: 'Blog | ReplyStack' })}
        description={t('seo.description', {
          defaultValue:
            'Tips, guides, and insights on AI-powered review management. Learn how to respond to customer reviews effectively.',
        })}
        canonicalPath={language === 'en' ? '/blog' : `/${language}/blog`}
        structuredData={getBlogListingSchema(filteredPosts)}
        includeHreflang
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 text-center mt-4 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mt-8 max-w-lg mx-auto relative"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                {/* Categories */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h2 className="font-semibold text-gray-900 mb-3">
                    {t('categories.title', { defaultValue: 'Categories' })}
                  </h2>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          !currentCategory
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t('categories.all')}
                        <span className="ml-2 text-gray-400">({totalPosts})</span>
                      </button>
                    </li>
                    {(
                      Object.entries(categoriesWithCounts) as [BlogCategory, number][]
                    ).map(([category, count]) => (
                      <li key={category}>
                        <button
                          onClick={() => handleCategoryChange(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentCategory === category
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t(`categories.${category}`)}
                          <span className="ml-2 text-gray-400">({count})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Posts */}
            <main className="flex-1">
              {searchQuery && (
                <p className="text-gray-600 mb-6">
                  {t('search.resultsCount', { count: filteredPosts.length })}
                </p>
              )}

              {hasContent ? (
                <BlogList
                  posts={filteredPosts}
                  pagination={searchQuery ? undefined : pagination}
                  onPageChange={handlePageChange}
                  showFeatured={!searchQuery && !currentCategory && currentPage === 1}
                />
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('empty.title', { defaultValue: 'Coming Soon' })}
                  </h2>
                  <p className="text-gray-600">
                    {t('empty.description', {
                      defaultValue:
                        "We're working on great content. Check back soon!",
                    })}
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default BlogIndex;
