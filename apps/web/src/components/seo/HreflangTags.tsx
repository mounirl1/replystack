import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'pt'] as const;
const BASE_URL = 'https://www.reply-stack.app';

interface HreflangTagsProps {
  /**
   * Optional custom path. If not provided, uses current route.
   */
  path?: string;
}

/**
 * Get the base path without language prefix
 */
function getBasePathWithoutLang(pathname: string): string {
  // Remove language prefix if present (e.g., /fr/blog -> /blog)
  return pathname.replace(/^\/(fr|es|pt)\//, '/').replace(/^\/(fr|es|pt)$/, '/');
}

/**
 * Component that generates hreflang link tags for multi-language SEO.
 * Should be included in all public pages.
 */
export function HreflangTags({ path }: HreflangTagsProps) {
  const location = useLocation();
  const currentPath = path || location.pathname;

  // Get the base path without language prefix and query params
  const cleanPath = currentPath.replace(/\?.*$/, '');
  const basePath = getBasePathWithoutLang(cleanPath);

  return (
    <Helmet>
      {/* Generate hreflang for each supported language */}
      {SUPPORTED_LANGUAGES.map((lang) => {
        // English uses root path, other languages use /{lang}/ prefix
        const langUrl = lang === 'en'
          ? `${BASE_URL}${basePath}`
          : `${BASE_URL}/${lang}${basePath}`;
        return (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={langUrl}
          />
        );
      })}

      {/* x-default for language selection page / default language (English) */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}${basePath}`}
      />
    </Helmet>
  );
}

export default HreflangTags;
