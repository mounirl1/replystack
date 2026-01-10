/**
 * Extension store URLs configuration
 * Update EXTENSION_ID with your actual Chrome Web Store extension ID
 */

export const EXTENSION_URLS = {
  chrome: 'https://chromewebstore.google.com/detail/replystack/YOUR_EXTENSION_ID',
  firefox: 'https://addons.mozilla.org/firefox/addon/replystack/',
} as const;

/**
 * Detect the user's browser
 */
export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('edg/')) return 'edge';
  if (userAgent.includes('chrome') && !userAgent.includes('edg/')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';

  return 'other';
}

/**
 * Get the recommended extension URL based on browser
 */
export function getRecommendedExtensionUrl(): string {
  const browser = detectBrowser();

  // Edge can use Chrome extensions
  if (browser === 'chrome' || browser === 'edge') {
    return EXTENSION_URLS.chrome;
  }

  if (browser === 'firefox') {
    return EXTENSION_URLS.firefox;
  }

  // Default to Chrome for Safari and others
  return EXTENSION_URLS.chrome;
}
