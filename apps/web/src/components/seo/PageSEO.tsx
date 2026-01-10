import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { HreflangTags } from './HreflangTags';

const BASE_URL = 'https://replystack.io';

interface PageSEOProps {
  /**
   * Translation key for the page title (will be fetched from i18n)
   */
  titleKey?: string;

  /**
   * Direct title string (use if not using i18n)
   */
  title?: string;

  /**
   * Translation key for the meta description
   */
  descriptionKey?: string;

  /**
   * Direct description string
   */
  description?: string;

  /**
   * Translation namespace to use
   */
  namespace?: string;

  /**
   * Canonical URL path (defaults to current path)
   */
  canonicalPath?: string;

  /**
   * Open Graph image URL
   */
  ogImage?: string;

  /**
   * Open Graph type
   */
  ogType?: 'website' | 'article' | 'product';

  /**
   * Keywords for meta tag
   */
  keywords?: string;

  /**
   * JSON-LD structured data
   */
  structuredData?: object;

  /**
   * Whether to add noindex meta tag
   */
  noindex?: boolean;

  /**
   * Whether to include hreflang tags
   */
  includeHreflang?: boolean;
}

/**
 * Reusable SEO component for consistent meta tags across pages.
 */
export function PageSEO({
  titleKey,
  title: directTitle,
  descriptionKey,
  description: directDescription,
  namespace = 'common',
  canonicalPath,
  ogImage = `${BASE_URL}/og-image.png`,
  ogType = 'website',
  keywords,
  structuredData,
  noindex = false,
  includeHreflang = true,
}: PageSEOProps) {
  const { t } = useTranslation(namespace);
  const location = useLocation();

  // Resolve title and description
  const title = directTitle || (titleKey ? t(titleKey) : 'ReplyStack');
  const description = directDescription || (descriptionKey ? t(descriptionKey) : '');

  // Build canonical URL
  const canonicalUrl = `${BASE_URL}${canonicalPath || location.pathname}`;

  return (
    <>
      <Helmet>
        {/* Basic meta tags */}
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}

        {/* Robots */}
        {noindex && <meta name="robots" content="noindex, nofollow" />}

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="ReplyStack" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:image" content={ogImage} />

        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      {/* Hreflang tags for multi-language support */}
      {includeHreflang && <HreflangTags />}
    </>
  );
}

export default PageSEO;
