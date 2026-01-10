import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'it', 'pt'] as const;
const BASE_URL = 'https://replystack.io';

interface HreflangTagsProps {
  /**
   * Optional custom path. If not provided, uses current route.
   */
  path?: string;
}

/**
 * Component that generates hreflang link tags for multi-language SEO.
 * Should be included in all public pages.
 */
export function HreflangTags({ path }: HreflangTagsProps) {
  const location = useLocation();
  const currentPath = path || location.pathname;

  // Generate the base URL without language parameter
  const basePath = currentPath.replace(/\?.*$/, '');

  return (
    <Helmet>
      {/* Generate hreflang for each supported language */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${BASE_URL}${basePath}${basePath.includes('?') ? '&' : '?'}lang=${lang}`}
        />
      ))}

      {/* x-default for language selection page / default language */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${BASE_URL}${basePath}`}
      />
    </Helmet>
  );
}

export default HreflangTags;
