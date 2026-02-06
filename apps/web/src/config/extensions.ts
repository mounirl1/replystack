/**
 * Extension store URLs configuration
 */

export const EXTENSION_URL = 'https://chromewebstore.google.com/detail/replystack-ai-review-repl/lndladejifmbadjgnbigjdiiochocddh';

// Legacy export for backwards compatibility
export const EXTENSION_URLS = {
  chrome: EXTENSION_URL,
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
 * Check if the current browser supports the extension
 */
export function isBrowserSupported(): boolean {
  const browser = detectBrowser();
  return browser === 'chrome' || browser === 'edge';
}

/**
 * Get the extension URL
 */
export function getExtensionUrl(): string {
  return EXTENSION_URL;
}
