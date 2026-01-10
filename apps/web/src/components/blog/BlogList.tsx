import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlogPostMeta, BlogPagination } from '@/lib/blog/types';
import { BlogCard } from './BlogCard';

interface BlogListProps {
  posts: BlogPostMeta[];
  pagination?: BlogPagination;
  onPageChange?: (page: number) => void;
  showFeatured?: boolean;
  emptyMessage?: string;
}

export function BlogList({
  posts,
  pagination,
  onPageChange,
  showFeatured = true,
  emptyMessage,
}: BlogListProps) {
  const { t } = useTranslation('blog');

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage || t('search.noResults')}</p>
      </div>
    );
  }

  // Split featured and regular posts
  const featuredPost = showFeatured && posts.length > 0 ? posts[0] : null;
  const regularPosts = showFeatured && posts.length > 0 ? posts.slice(1) : posts;

  return (
    <div className="space-y-8">
      {/* Featured post */}
      {featuredPost && (
        <BlogCard post={featuredPost} variant="featured" />
      )}

      {/* Regular posts grid */}
      {regularPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <BlogPaginationNav pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

interface BlogPaginationNavProps {
  pagination: BlogPagination;
  onPageChange?: (page: number) => void;
}

function BlogPaginationNav({ pagination, onPageChange }: BlogPaginationNavProps) {
  const { t } = useTranslation('blog');
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;

  const handlePrev = () => {
    if (hasPrevPage && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showAround = 2; // Pages to show around current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - showAround && i <= currentPage + showAround)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-8"
      aria-label="Blog pagination"
    >
      {/* Previous */}
      <button
        onClick={handlePrev}
        disabled={!hasPrevPage}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={t('pagination.previous')}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">{t('pagination.previous')}</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, i) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={handleNext}
        disabled={!hasNextPage}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={t('pagination.next')}
      >
        <span className="hidden sm:inline">{t('pagination.next')}</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default BlogList;
