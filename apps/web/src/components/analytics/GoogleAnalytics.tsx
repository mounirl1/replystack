import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// GA4 Measurement ID - Set VITE_GA_MEASUREMENT_ID in environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics 4
 * Only loads if user has given consent (stored in localStorage)
 */
export function initGA(): void {
  // Check for consent
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') {
    return;
  }

  // Don't initialize if already loaded
  if (typeof window.gtag === 'function') {
    return;
  }

  // Initialize dataLayer and gtag FIRST (standard Google implementation)
  window.dataLayer = window.dataLayer || [];

  // Use the exact Google implementation with function declaration
  function gtag(...args: unknown[]) {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // These commands will be queued and processed when gtag.js loads
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA
  });

  // NOW load the script (after gtag is defined)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Track page views for SPA navigation
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * Track custom events
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
): void {
  if (!window.gtag) return;

  window.gtag('event', eventName, {
    ...parameters,
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * Component that initializes GA and tracks page views
 */
export function GoogleAnalytics() {
  const location = useLocation();

  // Initialize GA on mount (if consent given)
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Small delay to ensure page title has updated
    const timeout = setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location]);

  return null;
}

export default GoogleAnalytics;
